import { Navbar } from "../Shared/Navbar";
import { useGetAllApplicants } from "../../Hooks/getAllApplicants";
import { useDispatch, useSelector } from "react-redux";
import {
  generateApplicantSummaryAPI,
  handleStatusUpdateAPI,
} from "../../../Api/postAPI";
import { useNavigate, useParams } from "react-router-dom";
import { setLoading } from "../../../store/authSlice";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { JobNotFound } from "../JobNotFound";
import { toast } from "react-toastify";
import { HiSparkles, HiLockClosed } from "react-icons/hi2";
import { getApiErrorMessage } from "../../../util/getApiErrorMessage";
import { ButtonSpinner } from "./admin components/ButtonSpinner";
import { useRecruiterAiAccess } from "../../Hooks/useRecruiterAiAccess";
import { AiPremiumLockBanner } from "./admin components/AiPremiumLockBanner";
import {
  SORT_MODES,
  countScoredApplicants,
  getTopPickIds,
  sortApplicants,
} from "../../../util/sortApplicants";

export const AdminApplicants = () => {
  const { jobID } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allApplicants } = useSelector((store) => store.application);
  const { loading } = useSelector((store) => store.auth);
  const [loadingId, setLoadingId] = useState(null);
  const [summaryLoadingId, setSummaryLoadingId] = useState(null);
  const [localApplicants, setLocalApplicants] = useState([]);
  const [sortMode, setSortMode] = useState(SORT_MODES.DATE);
  const { isSubscribed, guardAiAction, redirectToSubscribe, handleAiApiError } =
    useRecruiterAiAccess();

  useGetAllApplicants(jobID);

  const displayedApplicants = useMemo(
    () => sortApplicants(localApplicants, sortMode),
    [localApplicants, sortMode]
  );

  const topPickIds = useMemo(() => {
    if (sortMode !== SORT_MODES.AI) return new Set();
    return getTopPickIds(displayedApplicants);
  }, [displayedApplicants, sortMode]);

  // Sync local state with Redux state to prevent unnecessary re-renders
  useEffect(() => {
    setLocalApplicants(allApplicants);
  }, [allApplicants]);

  useEffect(() => {
    if (!isSubscribed && sortMode === SORT_MODES.AI) {
      setSortMode(SORT_MODES.DATE);
    }
  }, [isSubscribed, sortMode]);

  const handleGenerateSummary = async (applicationId, forceRegenerate = false) => {
    if (!guardAiAction()) return;

    try {
      setSummaryLoadingId(applicationId);
      const response = await generateApplicantSummaryAPI({
        applicationId,
        forceRegenerate,
      });

      if (response.data.SUCCESS) {
        const { summary, matchScore, generatedAt } = response.data.data;

        setLocalApplicants((prev) =>
          prev.map((app) =>
            app._id === applicationId
              ? {
                  ...app,
                  aiSummary: summary,
                  aiMatchScore: matchScore,
                  aiInsightsAt: generatedAt,
                }
              : app
          )
        );

        toast.success(
          response.data.cached
            ? "AI summary loaded"
            : "AI summary generated from resume"
        );
      }
    } catch (error) {
      if (handleAiApiError(error)) return;
      toast.error(
        getApiErrorMessage(error, "Could not generate applicant summary")
      );
    } finally {
      setSummaryLoadingId(null);
    }
  };

  const handleAiShortlist = () => {
    if (!guardAiAction()) return;

    const scored = countScoredApplicants(localApplicants);

    if (scored === 0) {
      toast.info("Generate AI summaries first to rank applicants.");
      return;
    }

    setSortMode(SORT_MODES.AI);
    toast.success(`Ranked ${scored} applicant${scored === 1 ? "" : "s"} by match score`);
  };

  const handleAcceptRejectApplicant = async (status, applicationID) => {
    try {
      setLoadingId(applicationID);
      dispatch(setLoading(true));
      const response = await handleStatusUpdateAPI({ status }, applicationID);
      if (response.data.SUCCESS) {
        // Update only the changed applicant locally instead of refreshing
        setLocalApplicants((prev) =>
          prev.map((app) =>
            app._id === applicationID ? { ...app, status } : app
          )
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId(null);
      dispatch(setLoading(false));
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-112px)]">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="relative my-8 mx-auto max-w-6xl px-4 z-0">
        {!localApplicants.length ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "tween", duration: 1 }}
              className="text-5xl font-semibold mb-2 text-zinc-700 text-center dark:text-white tracking-tight"
            >
              Currently no
              <span className="text-blue-400 font-bold"> "Application" </span>
            </motion.div>
            <div className="h-96 w-full">
              <JobNotFound />
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "tween", duration: 1 }}
              className="mb-6 flex flex-col items-center gap-4"
            >
              <h1 className="text-3xl lg:text-4xl font-bold text-center dark:text-slate-100 text-gray-800">
                Total Applicants - {localApplicants.length}
              </h1>
              {!isSubscribed && (
                <div className="w-full max-w-lg">
                  <AiPremiumLockBanner onUnlock={redirectToSubscribe} />
                </div>
              )}
              <motion.div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSortMode(SORT_MODES.DATE)}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition ${
                    sortMode === SORT_MODES.DATE
                      ? "bg-zinc-700 text-white"
                      : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700"
                  }`}
                >
                  Applied date
                </button>
                <button
                  type="button"
                  onClick={handleAiShortlist}
                  className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition ${
                    !isSubscribed
                      ? "bg-zinc-700 text-white hover:bg-zinc-600"
                      : sortMode === SORT_MODES.AI
                        ? "bg-blue-400 text-white"
                        : "bg-white dark:bg-zinc-800 text-blue-500 dark:text-blue-300 border border-blue-400/40 hover:bg-blue-400/10"
                  }`}
                >
                  {!isSubscribed ? (
                    <HiLockClosed />
                  ) : (
                    <HiSparkles />
                  )}
                  {isSubscribed ? "AI Shortlist" : "Unlock AI Shortlist"}
                </button>
              </motion.div>
              {sortMode === SORT_MODES.AI && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Sorted by match score — top picks highlighted
                </p>
              )}
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {displayedApplicants.map((application, index) => (
                <div
                  key={application._id}
                  className={`relative bg-white dark:bg-zinc-800 p-5 rounded-lg shadow-lg border hover:shadow-xl transition-shadow ${
                    topPickIds.has(application._id)
                      ? "border-blue-400 dark:border-blue-400 ring-1 ring-blue-400/30"
                      : "border-gray-200 dark:border-zinc-700"
                  }`}
                >
                  {topPickIds.has(application._id) && (
                    <span className="absolute -top-2.5 left-3 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-400 text-white shadow-sm">
                      Top pick #{index + 1}
                    </span>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 dark:border-zinc-600">
                      <img
                        src={application?.applicant?.profile?.profilePhoto}
                        alt="PFP"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-lg md:text-sm lg:text-lg font-semibold dark:text-white">
                        {application?.applicant?.username}
                      </h2>
                      <p className="text-gray-500 text-[10px] dark:text-gray-300 lg:text-sm">
                        {application?.applicant?.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    <p>📞 {application?.applicant?.phoneNumber}</p>
                    <p>
                      📅 Applied on:{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                    <a
                      href={application?.applicant?.profile?.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-500 dark:text-blue-400 hover:underline"
                    >
                      📄 View Resume
                    </a>
                  </div>

                  <div className="mt-3 rounded-md border border-blue-400/25 bg-blue-400/5 dark:bg-blue-400/10 p-2.5">
                    {application.aiSummary ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-300">
                            AI insight
                          </span>
                          {application.aiMatchScore != null && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-500 dark:text-blue-300 border border-blue-400/30">
                              {application.aiMatchScore}% match
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-snug text-gray-700 dark:text-gray-300">
                          {application.aiSummary}
                        </p>
                        {isSubscribed ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleGenerateSummary(application._id, true)
                            }
                            disabled={summaryLoadingId === application._id}
                            className="text-[11px] text-blue-400 hover:text-blue-500 font-medium disabled:opacity-60"
                          >
                            {summaryLoadingId === application._id
                              ? "Refreshing..."
                              : "Refresh summary"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={redirectToSubscribe}
                            className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1"
                          >
                            <HiLockClosed />
                            Subscribe to refresh
                          </button>
                        )}
                      </div>
                    ) : !isSubscribed ? (
                      <AiPremiumLockBanner
                        onUnlock={redirectToSubscribe}
                        compact
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleGenerateSummary(application._id)}
                          disabled={
                            summaryLoadingId === application._id ||
                            !application?.applicant?.profile?.resume
                          }
                          className="w-full flex items-center justify-center gap-2 text-xs bg-blue-400 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-md transition"
                        >
                          {summaryLoadingId === application._id ? (
                            <>
                              <ButtonSpinner light size="sm" />
                              Analyzing resume...
                            </>
                          ) : (
                            <>
                              <HiSparkles />
                              Generate AI summary
                            </>
                          )}
                        </button>
                        {!application?.applicant?.profile?.resume && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 text-center">
                            No resume uploaded
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/admin/applicant/${application?.applicant?._id}/profile`
                      )
                    }
                    className="mt-3 w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition"
                  >
                    View Profile
                  </button>

                  <div className="mt-3 flex justify-between items-center gap-2">
                    {application?.status === "pending" ? (
                      loadingId === application?._id ? (
                        <div className="animate-spin h-5 w-5 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleAcceptRejectApplicant(
                                "accepted",
                                application?._id
                              )
                            }
                            className="px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition w-1/2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleAcceptRejectApplicant(
                                "rejected",
                                application?._id
                              )
                            }
                            className="px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition w-1/2"
                          >
                            Reject
                          </button>
                        </>
                      )
                    ) : (
                      <span
                        className={`px-3 py-2 text-white text-sm rounded-md ${
                          application?.status === "accepted"
                            ? "bg-green-500"
                            : "bg-red-500"
                        } w-full text-center`}
                      >
                        {application?.status.charAt(0).toUpperCase() +
                          application?.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
