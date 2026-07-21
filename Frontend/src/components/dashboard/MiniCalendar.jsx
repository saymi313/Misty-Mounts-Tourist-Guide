import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WD = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Compact month calendar with a highlighted trip range and a "today" marker.
 * Reference-styled (emerald). Prev/next shift the visible month.
 */
export default function MiniCalendar({ year = 2026, month = 4, rangeStart = 21, rangeEnd = 24, today = 4 }) {
  const [view, setView] = useState({ y: year, m: month });

  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const isCurrent = view.y === year && view.m === month;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const shift = (dir) => {
    let m = view.m + dir;
    let y = view.y;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setView({ y, m });
  };

  const inRange = (d) => isCurrent && d >= rangeStart && d <= rangeEnd;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">
          {MONTHS[view.m]} <span className="text-slate-400">{view.y}</span>
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => shift(1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500 text-emerald-600 transition-colors hover:bg-emerald-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center text-xs">
        {WD.map((w) => (
          <div key={w} className="pb-1 font-semibold text-slate-400">{w}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const range = inRange(d);
          const isEnd = range && (d === rangeStart || d === rangeEnd);
          const isToday = isCurrent && d === today && !range;
          return (
            <div key={d} className="flex justify-center py-0.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium ${
                  isEnd
                    ? "bg-emerald-500 text-white"
                    : range
                    ? "bg-emerald-100 text-emerald-700"
                    : isToday
                    ? "border border-apricot-400 text-apricot-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {d}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
