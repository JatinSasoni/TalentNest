/* eslint-disable react/prop-types */
export const ButtonSpinner = ({ light = false, size = "md" }) => {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5 border" : "h-4 w-4 border-2";
  const colorClass = light
    ? "border-white/35 border-t-white"
    : "border-gray-300 border-t-blue-400 dark:border-gray-600 dark:border-t-blue-400";

  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full ${sizeClass} ${colorClass}`}
      aria-hidden
    />
  );
};
