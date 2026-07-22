import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { TOAST_EVENT } from "../utils/toast";

// Per-type styling. Cards stay light so they read cleanly over both the dark
// user panel and the light admin/guide dashboards.
const STYLE = {
  success: { icon: CheckCircle2, accent: "text-emerald-500", bar: "bg-emerald-500" },
  error: { icon: AlertCircle, accent: "text-rose-500", bar: "bg-rose-500" },
  info: { icon: Info, accent: "text-sky-500", bar: "bg-sky-500" },
};

const EASE = [0.16, 1, 0.3, 1];

/** Global toast stack — mounted once in App, fed by the toast bus. */
const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const onToast = (e) => {
      const t = e.detail;
      setToasts((prev) => [...prev, t]);
      if (t.duration > 0) {
        setTimeout(() => dismiss(t.id), t.duration);
      }
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, [dismiss]);

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[250] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5 sm:right-5 sm:top-5">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const s = STYLE[t.type] || STYLE.info;
          const Icon = s.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.96, transition: { duration: 0.18 } }}
              transition={{ duration: 0.32, ease: EASE }}
              className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border border-slate-900/5 bg-white p-3.5 pl-4 shadow-[0_16px_40px_-16px_rgba(15,30,26,0.45)]"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${s.bar}`} />
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.accent}`} strokeWidth={2.4} />
              <p className="flex-1 pt-0.5 text-sm font-medium leading-snug text-slate-700">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="-mr-1 -mt-1 rounded-lg p-1 text-slate-300 transition-colors hover:text-slate-500"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default Toaster;
