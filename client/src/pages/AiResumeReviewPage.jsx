import { useEffect, useId, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-toastify";
import {
  HiSparkles,
  HiArrowUpTray,
  HiDocumentText,
  HiCheckCircle,
  HiLightBulb,
} from "react-icons/hi2";
import { FaRegFilePdf } from "react-icons/fa";
import {
  handleUpdateAPICall,
  reviewStudentResumeAPI,
} from "../../Api/postAPI";
import { getApiErrorMessage } from "../../util/getApiErrorMessage";
import { setLoggedInUser, setLoading } from "../../store/authSlice";
import { ButtonSpinner } from "../Components/admin/admin components/ButtonSpinner";

const getScoreStroke = (score) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#60a5fa";
  if (score >= 40) return "#f59e0b";
  return "#f87171";
};

const getScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs work";
};

const ScoreRing = ({ score }) => {
  const radius = 54;
  const stroke = 7;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative flex h-32 w-32 shrink-0 items-center justify-center"
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={normalizedRadius}
          strokeWidth={stroke}
          fill="none"
          className="stroke-gray-200 dark:stroke-zinc-700"
        />
        <circle
          cx="60"
          cy="60"
          r={normalizedRadius}
          strokeWidth={stroke}
          fill="none"
          stroke={getScoreStroke(score)}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="text-3xl font-bold tabular-nums text-zinc-800 dark:text-white">
          {score}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          / 100
        </span>
      </motion.div>
    </motion.div>
  );
};

const StepBadge = ({ step, label }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 px-2.5 py-1 text-[11px] font-medium text-blue-500 dark:bg-blue-400/15 dark:text-blue-300">
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-400 text-[10px] font-bold text-white">
      {step}
    </span>
    {label}
  </span>
);

const ActionCard = ({ children, accent = "default", className = "" }) => {
  const accents = {
    default:
      "border-zinc-200/80 bg-white dark:border-zinc-700 dark:bg-zinc-800/80",
    primary:
      "border-blue-400/25 bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/20 dark:to-zinc-800/80 dark:border-blue-400/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md ${accents[accent]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

const IconBox = ({ children, variant = "default" }) => (
  <div
    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
      variant === "primary"
        ? "bg-blue-400 text-white shadow-lg shadow-blue-400/25"
        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
    }`}
  >
    {children}
  </div>
);

export const AiResumeReviewPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputId = useId();
  const fileInputRef = useRef(null);
  const { loggedInUser, loading } = useSelector(
    (state) => state.auth,
    shallowEqual
  );

  const [resumeFile, setResumeFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const hasResume = Boolean(loggedInUser?.profile?.resume);
  const score = loggedInUser?.profile?.aiResumeScore;
  const hasReview = score != null && loggedInUser?.profile?.aiResumeReview;

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login");
      return;
    }
    if (loggedInUser.role === "recruiter") {
      navigate("/admin/jobs");
    }
  }, [loggedInUser, navigate]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }
    setResumeFile(file);
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      toast.info("Please choose a PDF resume to upload.");
      return;
    }

    try {
      setUploading(true);
      dispatch(setLoading(true));

      const formData = new FormData();
      formData.append("username", loggedInUser.username);
      formData.append("email", loggedInUser.email);
      formData.append("phoneNumber", loggedInUser.phoneNumber);
      formData.append("bio", loggedInUser.profile?.bio || "");
      formData.append(
        "skills",
        loggedInUser.profile?.skills?.join(", ") || ""
      );
      formData.append("file", resumeFile);

      const response = await handleUpdateAPICall(formData);

      if (response.status === 200) {
        dispatch(setLoggedInUser(response.data.user));
        setResumeFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success("Resume uploaded. You can review it now.");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to upload resume"));
    } finally {
      setUploading(false);
      dispatch(setLoading(false));
    }
  };

  const handleReview = async (forceRegenerate = false) => {
    if (!hasResume) {
      toast.info("Upload a resume first, then run AI review.");
      return;
    }

    try {
      setReviewing(true);
      const response = await reviewStudentResumeAPI({ forceRegenerate });

      if (response.data.SUCCESS) {
        if (response.data.user) {
          dispatch(setLoggedInUser(response.data.user));
        }
        toast.success(
          response.data.cached
            ? "Resume review loaded"
            : "Your resume has been reviewed"
        );
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not review resume"));
    } finally {
      setReviewing(false);
    }
  };

  if (!loggedInUser || loggedInUser.role !== "student") {
    return null;
  }

  const strengths = loggedInUser?.profile?.aiResumeStrengths || [];
  const improvements = loggedInUser?.profile?.aiResumeImprovements || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[calc(100vh-8rem)] pb-16"
    >
      <div className="relative mx-auto max-w-5xl px-4 pt-4 md:pt-6">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-1.5 text-xs font-medium text-blue-500 dark:text-blue-300">
            <HiSparkles className="h-3.5 w-3.5" />
            Powered by AI
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-white md:text-4xl">
            Resume <span className="text-blue-400">Review</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-500 dark:text-gray-400 md:text-base">
            Upload your CV, get an instant score, and actionable tips to stand
            out to recruiters.
          </p>
        </motion.header>

        {/* Action cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <ActionCard>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconBox>
                  <HiArrowUpTray className="h-5 w-5" />
                </IconBox>
                <div>
                  <h2 className="font-semibold text-zinc-800 dark:text-white">
                    Upload resume
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF format recommended
                  </p>
                </div>
              </div>
              <StepBadge step="1" label="Upload" />
            </div>

            {hasResume && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/30">
                  <FaRegFilePdf className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Current resume
                  </p>
                  <a
                    href={loggedInUser.profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm font-medium text-blue-400 hover:text-blue-500 hover:underline"
                  >
                    {loggedInUser.profile.resumeOriginalName || "View resume"}
                  </a>
                </div>
              </div>
            )}

            <label
              htmlFor={fileInputId}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileSelect(e.dataTransfer.files?.[0]);
              }}
              className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
                isDragging
                  ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-zinc-200 hover:border-blue-300 hover:bg-zinc-50/50 dark:border-zinc-600 dark:hover:border-blue-400/40 dark:hover:bg-zinc-900/30"
              }`}
            >
              <HiDocumentText className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {resumeFile ? resumeFile.name : "Drop PDF here or click to browse"}
              </p>
              <p className="mt-1 text-xs text-gray-400">Max 5MB · PDF only</p>
            </label>

            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            <button
              type="button"
              onClick={handleUploadResume}
              disabled={uploading || loading || !resumeFile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              {uploading ? (
                <>
                  <ButtonSpinner light />
                  Uploading...
                </>
              ) : (
                <>
                  <HiArrowUpTray className="h-4 w-4" />
                  {hasResume ? "Replace resume" : "Upload resume"}
                </>
              )}
            </button>
          </ActionCard>

          <ActionCard accent="primary">
            <div className="mb-5 flex items-start justify-between gap-3">
              <motion.div className="flex items-center gap-3">
                <IconBox variant="primary">
                  <HiSparkles className="h-5 w-5" />
                </IconBox>
                <div>
                  <h2 className="font-semibold text-zinc-800 dark:text-white">
                    AI analysis
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Score, summary & tips
                  </p>
                </div>
              </motion.div>
              <StepBadge step="2" label="Review" />
            </div>

            <ul className="mb-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Resume quality score out of 100
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Key strengths highlighted
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Actionable improvement suggestions
              </li>
            </ul>

            <button
              type="button"
              onClick={() => handleReview(false)}
              disabled={reviewing || !hasResume}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-400 py-3 text-sm font-medium text-white shadow-lg shadow-blue-400/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {reviewing ? (
                <>
                  <ButtonSpinner light />
                  Analyzing your resume...
                </>
              ) : (
                <>
                  <HiSparkles className="h-4 w-4" />
                  {hasReview ? "View latest review" : "Start AI review"}
                </>
              )}
            </button>

            {!hasResume && (
              <p className="mt-3 text-center text-xs text-amber-600 dark:text-amber-400">
                Upload a resume in step 1 to unlock AI review.
              </p>
            )}
          </ActionCard>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {hasReview ? (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-10 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800/80"
            >
              <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-6 py-4 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-800/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
                    Your results
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleReview(true)}
                    disabled={reviewing}
                    className="rounded-lg border border-blue-400/30 px-3 py-1.5 text-xs font-medium text-blue-500 transition hover:bg-blue-400/10 disabled:opacity-50 dark:text-blue-300"
                  >
                    {reviewing ? "Refreshing..." : "Run again"}
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col items-center gap-6 border-b border-zinc-100 pb-8 dark:border-zinc-700 md:flex-row md:items-start">
                  <ScoreRing score={score} />
                  <div className="flex-1 text-center md:text-left">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color: getScoreStroke(score),
                        backgroundColor: `${getScoreStroke(score)}18`,
                      }}
                    >
                      {getScoreLabel(score)}
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {loggedInUser.profile.aiResumeReview}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {strengths.length > 0 && (
                    <div className="rounded-xl border border-green-200/60 bg-green-50/50 p-5 dark:border-green-900/40 dark:bg-green-950/20">
                      <div className="mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                        <HiCheckCircle className="h-5 w-5" />
                        <h3 className="text-sm font-semibold">Strengths</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {strengths.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {improvements.length > 0 && (
                    <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                      <div className="mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <HiLightBulb className="h-5 w-5" />
                        <h3 className="text-sm font-semibold">
                          Areas to improve
                        </h3>
                      </div>
                      <ul className="space-y-2.5">
                        {improvements.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-800/30"
            >
              <HiSparkles className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                No review yet
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Upload your resume and run AI analysis to see your score here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
