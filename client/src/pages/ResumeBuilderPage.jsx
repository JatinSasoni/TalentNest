import { useEffect, useRef, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import { HiArrowDownTray } from "react-icons/hi2";
import { ResumeBuilderForm } from "../Components/resume-builder/ResumeBuilderForm";
import { ResumePreview } from "../Components/resume-builder/ResumePreview";
import { downloadResumePdf } from "../util/downloadResumePdf";
import {
  loadDraft,
  prefillFromUser,
  saveDraft,
} from "../util/resumeBuilderDefaults";
import { ButtonSpinner } from "../Components/admin/admin components/ButtonSpinner";

export const ResumeBuilderPage = () => {
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const { loggedInUser } = useSelector((state) => state.auth, shallowEqual);

  const [draft, setDraft] = useState(() => loadDraft(loggedInUser));
  const [mobileTab, setMobileTab] = useState("edit");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login");
      return;
    }
    if (loggedInUser.role === "recruiter") {
      navigate("/admin/jobs");
    }
  }, [loggedInUser, navigate]);

  useEffect(() => {
    if (loggedInUser?.role === "student") {
      setDraft(loadDraft(loggedInUser));
    }
  }, [loggedInUser?._id]);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(draft), 400);
    return () => clearTimeout(timer);
  }, [draft]);

  const handleDownload = async () => {
    if (!previewRef.current) {
      toast.error("Preview not ready. Try again.");
      return;
    }

    const name =
      draft.personal.fullName?.trim().replace(/\s+/g, "-") || "resume";

    try {
      setDownloading(true);
      await downloadResumePdf(previewRef.current, `${name}-resume.pdf`);
      toast.success("Resume downloaded!");
    } catch {
      toast.error("Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    const fresh = prefillFromUser(loggedInUser);
    setDraft(fresh);
    saveDraft(fresh);
    toast.info("Form reset");
  };

  if (!loggedInUser || loggedInUser.role !== "student") {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-white">
            Resume <span className="text-blue-400">Builder</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill the form, check the preview, then download your PDF.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-blue-400 hover:bg-blue-500 text-white disabled:opacity-60"
          >
            {downloading ? (
              <>
                <ButtonSpinner light />
                Downloading...
              </>
            ) : (
              <>
                <HiArrowDownTray />
                Download PDF
              </>
            )}
          </button>
        </div>
      </motion.div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
        Need this for job applications? Upload the PDF on{" "}
        <Link to="/resume-review" className="text-blue-400 hover:underline">
          AI Resume
        </Link>
        .
      </p>

      {/* Mobile: Edit / Preview tabs */}
      <div className="flex gap-2 mb-4 lg:hidden">
        {["edit", "preview"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize ${
              mobileTab === tab
                ? "bg-blue-400 text-white"
                : "bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Form column */}
        <div
          className={`bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 md:p-5 ${
            mobileTab === "preview" ? "hidden lg:block" : ""
          }`}
        >
          <ResumeBuilderForm draft={draft} setDraft={setDraft} />
        </div>

        {/* Preview column */}
        <div
          className={`lg:sticky lg:top-20 ${
            mobileTab === "edit" ? "hidden lg:block" : ""
          }`}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Preview
              </h2>
            </div>

            <div className="bg-gray-100 dark:bg-zinc-800 p-3 md:p-4 overflow-auto max-h-[70vh] lg:max-h-[calc(100vh-10rem)]">
              <ResumePreview draft={draft} screen />
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-zinc-700 lg:hidden">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-400 text-white text-sm disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <ButtonSpinner light />
                    Downloading...
                  </>
                ) : (
                  <>
                    <HiArrowDownTray />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-size page for PDF export */}
      <div
        aria-hidden
        className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none"
      >
        <ResumePreview ref={previewRef} draft={draft} />
      </div>
    </div>
  );
};
