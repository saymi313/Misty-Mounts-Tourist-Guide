import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { CONFIRM_EVENT } from "../utils/confirm";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Global confirmation dialog — mounted once in App, driven by the confirm bus.
 * Light-themed to match the admin/guide dashboards; renders above everything.
 */
const ConfirmDialog = () => {
  const [req, setReq] = useState(null); // { opts, resolve }

  useEffect(() => {
    const onReq = (e) => setReq(e.detail);
    window.addEventListener(CONFIRM_EVENT, onReq);
    return () => window.removeEventListener(CONFIRM_EVENT, onReq);
  }, []);

  const close = (result) => {
    if (req) req.resolve(result);
    setReq(null);
  };

  useEffect(() => {
    if (!req) return;
    const onKey = (e) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req]);

  const opts = req?.opts || {};
  const danger = opts.danger !== false; // defaults to a destructive/red confirm

  return createPortal(
    <AnimatePresence>
      {req && (
        <motion.div
          className="fixed inset-0 z-[240] flex items-center justify-center p-4 [color-scheme:light]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => close(false)} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
          >
            <div className="flex gap-4">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  danger ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  {opts.title || "Are you sure?"}
                </h3>
                {opts.body && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{opts.body}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => close(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                {opts.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => close(true)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                  danger ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {opts.confirmLabel || "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmDialog;
