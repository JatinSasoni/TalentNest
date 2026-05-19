import { HiLockClosed } from "react-icons/hi2";

/* eslint-disable react/prop-types */
export const AiPremiumLockBanner = ({ onUnlock, compact = false }) => {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onUnlock}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-md bg-zinc-700/90 hover:bg-zinc-600 text-white transition"
      >
        <HiLockClosed className="text-sm" />
        Subscribe to unlock AI
      </button>
    );
  }

  return (
    <div className="rounded-md border border-amber-400/40 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 flex items-start gap-2">
      <HiLockClosed className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
          Premium AI feature
        </p>
        <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80 mt-0.5">
          Subscribe to generate job descriptions, applicant insights, and AI
          shortlists.
        </p>
        <button
          type="button"
          onClick={onUnlock}
          className="mt-2 text-[11px] font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400"
        >
          View subscription plans →
        </button>
      </div>
    </div>
  );
};
