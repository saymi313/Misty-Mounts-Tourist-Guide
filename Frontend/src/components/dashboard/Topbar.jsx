import React from "react";
import { Search, Bell } from "lucide-react";

/**
 * Dashboard topbar: greeting + subtitle on the left, search + notification bell
 * on the right (profile lives in the right rail, per the reference).
 */
export default function Topbar({ greeting, subtitle, searchPlaceholder = "Search direction" }) {
  return (
    <header className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{greeting}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:border-emerald-400 sm:w-64"
          />
        </div>
        <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-emerald-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
