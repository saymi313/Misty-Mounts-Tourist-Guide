import React from "react";

/**
 * Minimal, dependency-free bar chart for partner insights. Single-series
 * magnitude-over-time: one hue, recessive baseline, value revealed on hover
 * (no number on every bar). Responsive via flexbox — no viewBox math.
 */
export default function BarChart({ data = [], format = (v) => v, color = "#65a30d", barsHeight = 168 }) {
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height: barsHeight }}>
        {data.map((d, i) => {
          const v = Number(d.value) || 0;
          const h = Math.round((v / max) * (barsHeight - 8)) + 2;
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className="pointer-events-none absolute z-10 -translate-y-1 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                style={{ bottom: h + 6 }}
              >
                {format(v)}
              </div>
              <div
                className="w-full max-w-[44px] rounded-t-md transition-[height] duration-300"
                style={{ height: h, background: color, opacity: v === 0 ? 0.25 : 1 }}
                aria-label={`${d.label}: ${format(v)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[11px] font-medium text-slate-400">{d.label}</span>
        ))}
      </div>
    </div>
  );
}
