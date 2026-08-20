import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Compact page control for dashboard tables/grids. Renders nothing for a single
 * page. Shows first/last + a window around the current page with ellipses.
 */
export default function Pagination({ page, pageCount, setPage, className = "" }) {
  if (!pageCount || pageCount <= 1) return null;
  const go = (p) => setPage(Math.min(pageCount, Math.max(1, p)));

  const pages = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || (p >= page - 1 && p <= page + 1)) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const btn = "flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors";

  return (
    <div className={`mt-5 flex items-center justify-center gap-1.5 ${className}`}>
      <button onClick={() => go(page - 1)} disabled={page === 1} className={`${btn} border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40`} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-slate-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${p === page ? "bg-lime-400 text-night-950 shadow-sm shadow-lime-400/30" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {p}
          </button>
        )
      )}
      <button onClick={() => go(page + 1)} disabled={page === pageCount} className={`${btn} border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40`} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
