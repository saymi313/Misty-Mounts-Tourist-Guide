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
export default function Modal({ open, onClose, title, subtitle, icon: Icon, onSubmit, footer, children, size = "md" }) {
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

  const maxW =
    { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" }[size] || "max-w-lg";
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
            {...(onSubmit ? { onSubmit, noValidate: true } : {})}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex max-h-[calc(100vh-3rem)] w-full ${maxW} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5 [color-scheme:light]`}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-7 py-5">
              <div className="flex items-start gap-3.5">
                {Icon && (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-bold leading-tight text-slate-900">{title}</h3>
                  {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">{children}</div>

            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-7 py-4">
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
