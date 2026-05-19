import { HiStar } from "react-icons/hi2";

export const NewFeatureBadge = ({ className = "" }) => (
  <span
    className={`relative inline-flex items-center gap-0.5 rounded-full border border-amber-400/25 bg-gradient-to-r from-amber-50 to-amber-100/80 px-1.5 py-0.5 text-[8px] font-semibold uppercase leading-none tracking-widest text-amber-700 shadow-sm dark:from-amber-400/10 dark:to-amber-400/5 dark:border-amber-400/20 dark:text-amber-300 ${className}`}
    aria-label="New feature"
  >
    <HiStar
      className="h-2 w-2 shrink-0 text-amber-500 dark:text-amber-400"
      aria-hidden
    />
    New
  </span>
);
