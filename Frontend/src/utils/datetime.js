/** Date/time formatting helpers (frontend-only, backend disconnected). */

/** e.g. "14 Aug 2026". */
export const formatDate = (v, opts = { day: "numeric", month: "short", year: "numeric" }) =>
  v ? new Date(v).toLocaleDateString("en-GB", opts) : "";

/** Compact relative time, e.g. "just now", "5m ago", "3h ago", "2d ago", then a date. */
export const timeAgo = (v) => {
  if (!v) return "";
  const diff = Math.max(1, Math.floor((Date.now() - new Date(v).getTime()) / 1000));
  const mins = Math.floor(diff / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (diff < 60) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(v, { day: "numeric", month: "short" });
};
