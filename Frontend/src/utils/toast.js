// ─────────────────────────────────────────────────────────────────────────────
// Toast bus — a tiny event-based notifier so any module can raise a toast
// without prop-drilling a provider. Mount <Toaster /> once (see App.jsx) and
// call toast.success(...) / toast.error(...) / toast.info(...) from anywhere.
// ─────────────────────────────────────────────────────────────────────────────
export const TOAST_EVENT = "mm-toast";

let counter = 0;

const push = (type, message, opts = {}) => {
  if (!message) return;
  const detail = { id: ++counter, type, message, duration: opts.duration ?? 4000 };
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail }));
  return detail.id;
};

export const toast = {
  push,
  success: (message, opts) => push("success", message, opts),
  error: (message, opts) => push("error", message, opts),
  info: (message, opts) => push("info", message, opts),
};

export default toast;
