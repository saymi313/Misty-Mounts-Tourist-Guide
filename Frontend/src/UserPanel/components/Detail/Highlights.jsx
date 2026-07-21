import React, { useEffect, useState } from "react";
import { AlertTriangle, X, MapPin } from "lucide-react";
import { getDisasters } from "../../../data/mockApi";

const severityStyles = {
  High: {
    ring: "border-rose-500/30",
    glow: "bg-rose-500/10",
    icon: "text-rose-400",
    label: "text-rose-400",
  },
  Medium: {
    ring: "border-amber-400/30",
    glow: "bg-amber-400/10",
    icon: "text-amber-400",
    label: "text-amber-400",
  },
  Low: {
    ring: "border-lime-400/30",
    glow: "bg-lime-400/10",
    icon: "text-lime-400",
    label: "text-lime-400",
  },
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
    <div className={`relative mt-8 flex items-start gap-3 overflow-hidden rounded-[1.4rem] border bg-night-800 px-5 py-4 ${tone.ring}`}>
      <div className={`pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-3xl ${tone.glow}`} />
      <AlertTriangle className={`relative mt-0.5 h-5 w-5 shrink-0 ${tone.icon}`} />
      <div className="relative flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`text-xs font-bold uppercase tracking-wider ${tone.label}`}>{alert.severity} alert</span>
          <span className="text-base font-extrabold text-white">{alert.name}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
          <MapPin className="h-3 w-3" /> {alert.location}
        </p>
        <p className="mt-1.5 text-sm text-white/70">{alert.description}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="relative rounded-lg p-1 text-white/50 transition-colors hover:text-white"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Highlights;
