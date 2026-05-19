import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-toastify";
import { HiSparkles, HiXMark, HiArrowPath, HiLockClosed } from "react-icons/hi2";
import { generateJobDescriptionAPI } from "../../../../Api/postAPI";
import { ButtonSpinner } from "./ButtonSpinner";
import { useRecruiterAiAccess } from "../../../Hooks/useRecruiterAiAccess";
import { AiPremiumLockBanner } from "./AiPremiumLockBanner";
import { getApiErrorMessage } from "../../../../util/getApiErrorMessage";

/* eslint-disable react/prop-types */
export const AiJobSuggestionPanel = ({
  formValues,
  onApplySuggestion,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [hints, setHints] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);
  const { isSubscribed, guardAiAction, redirectToSubscribe, handleAiApiError } =
    useRecruiterAiAccess();

  const handleGenerate = async () => {
    if (!formValues.title?.trim()) {
      toast.info("Enter a job title first, then get AI suggestions.");
      return;
    }

    try {
      setLoading(true);
      if (!suggestion) setDescExpanded(false);

      const response = await generateJobDescriptionAPI({
        title: formValues.title,
        location: formValues.location,
        jobType: formValues.jobType,
        experienceLevel: formValues.experienceLevel,
        salary: formValues.salary,
        companyName: formValues.companyName,
        hints: hints.trim() || undefined,
      });

      if (response.data.SUCCESS) {
        setSuggestion(response.data.data);
        setDescExpanded(false);
        toast.success("AI suggestion ready — review and apply below.");
      }
    } catch (error) {
      if (handleAiApiError(error)) return;
      toast.error(
        getApiErrorMessage(error, "Could not generate suggestion. Try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const onGenerateClick = () => {
    if (!guardAiAction()) return;
    handleGenerate();
  };

  const handleApplyAll = () => {
    if (!guardAiAction()) return;
    if (!suggestion) return;
    onApplySuggestion({
      description: suggestion.description,
      requirements: suggestion.requirements.join(", "),
    });
    toast.success("Applied AI suggestion to the form.");
  };

  const handleDismiss = () => {
    setSuggestion(null);
    setDescExpanded(false);
  };

  const descriptionPreview =
    suggestion?.description &&
    suggestion.description.length > 220 &&
    !descExpanded
      ? `${suggestion.description.slice(0, 220).trim()}…`
      : suggestion?.description;

  return (
    <aside className="lg:sticky lg:top-24 h-fit w-full lg:min-w-[380px] lg:max-w-[520px]">
      <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-zinc-800/80 p-4 shadow-sm">
        <motion.div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-blue-400"
          >
            <HiSparkles className="text-xl shrink-0" />
            <h2 className="font-semibold text-zinc-800 dark:text-slate-100 text-sm">
              AI Job Assistant
            </h2>
          </motion.div>

          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Fill in title and other details, then generate a description and
            requirements you can apply to the form.
          </p>

          {!isSubscribed && (
            <AiPremiumLockBanner onUnlock={redirectToSubscribe} />
          )}

          <AnimatePresence mode="wait">
            {!suggestion ? (
              <motion.div
                key="ai-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Extra hints (optional)
                  </label>
                  <textarea
                    value={hints}
                    onChange={(e) => setHints(e.target.value)}
                    rows={2}
                    placeholder="e.g. Remote-friendly, startup culture..."
                    disabled={disabled || loading || !isSubscribed}
                    className="w-full px-3 py-2 text-sm border rounded-md text-gray-900 dark:text-white bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none resize-none disabled:opacity-60"
                  />
                </div>

                {!isSubscribed ? (
                  <button
                    type="button"
                    onClick={redirectToSubscribe}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition duration-200"
                  >
                    <HiLockClosed />
                    Subscribe to unlock AI
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGenerateClick}
                    disabled={disabled || loading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-400 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 px-4 rounded-lg transition duration-200"
                  >
                    {loading ? (
                      <>
                        <ButtonSpinner light />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <HiSparkles />
                        Show AI Suggestion
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="ai-results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-lg border border-blue-400/30 dark:border-blue-400/20 overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm"
              >
                {/* Results header */}
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-blue-400/10 dark:bg-blue-400/5 border-b border-blue-400/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 size-2 rounded-full bg-blue-400 animate-pulse" />
                    <p className="text-xs font-semibold text-blue-500 dark:text-blue-300 truncate">
                      Suggestion ready
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss suggestion"
                    className="shrink-0 p-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-200/80 dark:hover:text-gray-200 dark:hover:bg-zinc-700 transition"
                  >
                    <HiXMark className="text-base" />
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain px-3 py-3 space-y-4 ai-suggestion-scroll">
                  <section>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Description
                      </h3>
                      {suggestion.description.length > 220 && (
                        <button
                          type="button"
                          onClick={() => setDescExpanded((v) => !v)}
                          className="text-[11px] text-blue-400 hover:text-blue-500 font-medium"
                        >
                          {descExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {descriptionPreview}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                      Requirements ({suggestion.requirements.length})
                    </h3>
                    <ol className="space-y-2">
                      {suggestion.requirements.map((req, index) => (
                        <li
                          key={`${index}-${req.slice(0, 24)}`}
                          className="flex gap-2 text-xs leading-snug text-gray-700 dark:text-gray-300"
                        >
                          <span className="shrink-0 flex items-center justify-center size-5 rounded-full bg-blue-400/15 text-blue-500 dark:text-blue-300 text-[10px] font-semibold">
                            {index + 1}
                          </span>
                          <span className="pt-0.5">{req}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>

                {/* Actions */}
                <motion.div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-zinc-900/60 space-y-2">
                  <button
                    type="button"
                    onClick={handleApplyAll}
                    disabled={loading}
                    className="w-full text-sm bg-blue-400 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-3 rounded-lg transition duration-200"
                  >
                    Apply to form
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onGenerateClick}
                      disabled={loading || !isSubscribed}
                      className="flex items-center justify-center gap-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-800 font-medium py-2 px-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <ButtonSpinner size="sm" />
                          <span>Regenerating...</span>
                        </>
                      ) : !isSubscribed ? (
                        <>
                          <HiLockClosed className="text-sm" />
                          <span>Subscribe</span>
                        </>
                      ) : (
                        <>
                          <HiArrowPath className="text-sm" />
                          <span>Regenerate</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      disabled={loading}
                      className="text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2 px-2 rounded-lg transition"
                    >
                      Back to edit
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        .ai-suggestion-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .ai-suggestion-scroll::-webkit-scrollbar-thumb {
          background: rgba(96, 165, 250, 0.45);
          border-radius: 4px;
        }
      `}</style>
    </aside>
  );
};
