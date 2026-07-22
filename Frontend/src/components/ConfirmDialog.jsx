import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { CONFIRM_EVENT } from "../utils/confirm";

const EASE = [0.16, 1, 0.3, 1];

// Match the surface the dialog opens over: dark on the traveller app (always
// dark) and on the admin/guide panels while night mode is on; light on the
// admin/guide panels in day mode.
const computeDark = () => {
  if (typeof document === "undefined") return true;
  if (document.body.classList.contains("mm-night")) return true;
  const p = window.location.pathname;
  const dashboard = p.startsWith("/admin") || p.startsWith("/local-guide");
  return !dashboard;
};

/**
 * Global confirmation dialog — mounted once in App, driven by the confirm bus.
 * Theme-aware so it matches whichever panel triggered it.
 */
const ConfirmDialog = () => {
  const [req, setReq] = useState(null); // { opts, resolve, dark }

  useEffect(() => {
    const onReq = (e) => setReq({ ...e.detail, dark: computeDark() });
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
  const dark = !!req?.dark;

  const backdrop = dark ? "bg-night-950/70" : "bg-slate-900/50";
  const panel = dark
    ? "bg-night-900 text-white ring-1 ring-white/10"
    : "bg-white ring-1 ring-slate-900/5";
  const titleCls = dark ? "text-white" : "text-slate-900";
  const bodyCls = dark ? "text-white/60" : "text-slate-500";
  const iconCls = danger
    ? dark ? "bg-rose-500/15 text-rose-400" : "bg-rose-50 text-rose-500"
    : dark ? "bg-lime-400/15 text-lime-400" : "bg-emerald-50 text-emerald-600";
  const cancelCls = dark
    ? "border border-white/15 text-white/80 hover:bg-white/5"
    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50";
  const confirmCls = danger
    ? "bg-rose-500 text-white hover:bg-rose-600"
    : dark ? "bg-lime-400 text-night-950 hover:bg-lime-300" : "bg-emerald-500 text-white hover:bg-emerald-600";

  return createPortal(
    <AnimatePresence>
      {req && (
        <motion.div
          className={`fixed inset-0 z-[240] flex items-center justify-center p-4 ${dark ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className={`absolute inset-0 backdrop-blur-sm ${backdrop}`} onClick={() => close(false)} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl ${panel}`}
          >
            <div className="flex gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconCls}`}>
                <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className={`text-lg font-bold tracking-tight ${titleCls}`}>
                  {opts.title || "Are you sure?"}
                </h3>
                {opts.body && <p className={`mt-1.5 text-sm leading-relaxed ${bodyCls}`}>{opts.body}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => close(false)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${cancelCls}`}
              >
                {opts.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => close(true)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors ${confirmCls}`}
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
