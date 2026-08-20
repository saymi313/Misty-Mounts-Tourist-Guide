import React, { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { getDisasters } from "../data/mockApi";
import { formatDate } from "../utils/datetime";

const SEVERITY = {
  High: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  Medium: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Low: "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

const matches = (d, filter) => {
  if (!filter) return true;
  const hay = `${d.location || ""} ${d.name || ""} ${(d.affectedAreas || []).join(" ")}`.toLowerCase();
  return hay.includes(filter.toLowerCase());
};

/**
 * Live hazard alerts from the natural-disaster API. Shows only unresolved
 * alerts. Pass `filter` (a city or region name) to scope to one area, and
 * `compact` for the small in-page banner variant.
 */
const HazardAlerts = ({ filter, compact = false, className = "" }) => {
  const [alerts, setAlerts] = useState(null); // null = loading

  useEffect(() => {
    let alive = true;
    getDisasters()
      .then((res) => {
        const list = (res?.data || res || []).filter((d) => !d.isResolved && matches(d, filter));
        if (alive) setAlerts(list);
      })
      .catch(() => alive && setAlerts([]));
    return () => { alive = false; };
  }, [filter]);

  if (alerts === null) return null; // stay quiet while loading

  // Compact banner: render nothing when the area is clear.
  if (compact) {
    if (!alerts.length) return null;
    return (
      <div className={`space-y-2 ${className}`}>
        {alerts.map((d) => (
          <div key={d._id || d.name} className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${SEVERITY[d.severity] || SEVERITY.Low}`}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span><span className="font-bold">{d.severity} · {d.name}</span> — {d.description}</span>
          </div>
        ))}
      </div>
    );
  }

  // Full list (Safety page)
  return (
    <div className={className}>
      {!alerts.length ? (
        <div className="flex items-center gap-3 rounded-3xl border border-lime-400/25 bg-lime-400/[0.06] p-6 text-lime-200">
          <ShieldCheck className="h-6 w-6 text-lime-400" />
          <p className="text-sm font-medium">No active hazard alerts right now. Always check local conditions before you travel.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((d) => (
            <div key={d._id || d.name} className={`rounded-3xl border p-5 ${SEVERITY[d.severity] || SEVERITY.Low}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-extrabold"><AlertTriangle className="h-4 w-4" /> {d.name}</h3>
                <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-xs font-bold">{d.severity}</span>
              </div>
              <p className="mt-2 text-sm text-white/75">{d.description}</p>
              <p className="mt-2 text-xs text-white/50">
                {d.location}{d.date ? ` · ${formatDate(d.date)}` : ""}
                {d.affectedAreas?.length ? ` · Affected: ${d.affectedAreas.join(", ")}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HazardAlerts;
