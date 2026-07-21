import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * Portal-based modal. Rendered to <body> so it can never be clipped or
 * mis-stacked by the dashboard's flex/overflow containers. The dialog is a
 * flex column: fixed header + SCROLLABLE body + sticky footer, so the actions
 * are always reachable even when the form is taller than the viewport.
 *
 * Pass `onSubmit` to make the whole dialog a <form> (footer buttons of
 * type="submit" then work); the footer stays pinned while the body scrolls.
 */
export default function Modal({ open, onClose, title, onSubmit, footer, children, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const maxW = size === "xl" ? "max-w-2xl" : size === "lg" ? "max-w-lg" : "max-w-md";
  const Dialog = onSubmit ? motion.form : motion.div;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

          {/* Dialog */}
          <Dialog
            {...(onSubmit ? { onSubmit } : {})}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex max-h-[calc(100vh-3rem)] w-full ${maxW} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                {footer}
              </div>
            )}
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
