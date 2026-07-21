import React, { useEffect, useState } from "react";
import { AlertTriangle, X, MapPin } from "lucide-react";
import { getDisasters } from "../../../data/mockApi";

const severityStyles = {
  High: "border-clay-500/30 bg-clay-500/5 text-clay-600 dark:border-clay-400/30 dark:bg-clay-400/10 dark:text-clay-400",
  Medium: "border-sand-300/40 bg-sand-300/15 text-sand-600 dark:border-sand-300/30 dark:bg-sand-300/10 dark:text-sand-300",
  Low: "border-glacier-500/30 bg-glacier-500/10 text-glacier-700 dark:border-glacier-400/30 dark:bg-glacier-400/10 dark:text-glacier-300",
};

const Highlights = () => {
  const [alert, setAlert] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getDisasters()
      .then((res) => setAlert((res.data || []).find((d) => !d.isResolved) || null))
      .catch(() => setAlert(null));
  }, []);

  if (!alert || dismissed) return null;

  const tone = severityStyles[alert.severity] || severityStyles.Low;

  return (
    <div className={`mt-8 flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${tone}`}>
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs font-bold uppercase tracking-wider">{alert.severity} alert</span>
          <span className="font-display text-base font-semibold text-abyss-900 dark:text-frost-50">{alert.name}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs opacity-80">
          <MapPin className="h-3 w-3" /> {alert.location}
        </p>
        <p className="mt-1.5 text-sm text-frost-600 dark:text-frost-300">{alert.description}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="rounded-lg p-1 text-frost-500 transition-colors hover:text-glacier-700 dark:text-frost-400 dark:hover:text-glacier-300"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Highlights;
