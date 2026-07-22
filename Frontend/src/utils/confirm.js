// ─────────────────────────────────────────────────────────────────────────────
// Confirm bus — promise-based confirmation dialog. Mount <ConfirmDialog /> once
// (see App.jsx), then in any handler:
//
//   if (!(await confirmDialog({ title, body, confirmLabel, danger }))) return;
//
// Resolves true when confirmed, false when cancelled / dismissed.
// ─────────────────────────────────────────────────────────────────────────────
export const CONFIRM_EVENT = "mm-confirm";

export const confirmDialog = (opts = {}) =>
  new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent(CONFIRM_EVENT, { detail: { opts, resolve } }));
  });

export default confirmDialog;
