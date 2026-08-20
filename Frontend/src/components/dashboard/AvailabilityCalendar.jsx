import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const key = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/**
 * Interactive month calendar for marking dates unavailable. `value` is an array
 * of "YYYY-MM-DD" strings (the blocked dates); tapping a day calls onToggle(key).
 * Past days are disabled. Purely controlled — no data fetching.
 */
export default function AvailabilityCalendar({ value = [], onToggle }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const blocked = new Set(value);

  const startDow = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const shift = (delta) => setView((v) => { const nd = new Date(v.y, v.m + delta, 1); return { y: nd.getFullYear(), m: nd.getMonth() }; });
  const atStart = view.y === today.getFullYear() && view.m === today.getMonth();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={atStart} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-slate-800">{MONTHS[view.m]} {view.y}</span>
        <button type="button" onClick={() => shift(1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const k = key(view.y, view.m, d);
          const past = new Date(view.y, view.m, d) < today;
          const off = blocked.has(k);
          return (
            <button
              type="button" key={i} disabled={past} onClick={() => onToggle(k)}
              className={`aspect-square rounded-lg text-xs font-semibold transition-colors ${
                past ? "cursor-not-allowed text-slate-300"
                : off ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-slate-50 text-slate-700 hover:bg-lime-100"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <span className="inline-block h-3 w-3 rounded bg-rose-500" /> Blocked (unavailable) — tap a date to toggle.
      </p>
    </div>
  );
}
