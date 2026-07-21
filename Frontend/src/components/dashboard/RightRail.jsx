import React from "react";
import { ChevronDown, CalendarDays, MoreHorizontal } from "lucide-react";
import { img } from "../../data/mockData";
import MiniCalendar from "./MiniCalendar";

/** Reference-style right rail: profile chip, calendar, and a schedule list. */
export default function RightRail({ user, schedule = [], calendar }) {
  return (
    <div className="space-y-6 py-6">
      {/* Profile chip */}
      <div className="flex items-center gap-3">
        <img
          src={user?.avatar || img("admin-avatar", 120, 120)}
          alt={user?.name}
          className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-400"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{user?.name || "Jemmy Max"}</p>
          <p className="truncate text-xs text-slate-400">{user?.role || "Traveler Enthusiast"}</p>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-600">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar */}
      {calendar || <MiniCalendar />}

      {/* Schedule */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900">My Schedule</h3>
          <MoreHorizontal className="h-5 w-5 text-slate-300" />
        </div>
        <div className="space-y-3">
          {schedule.map((s) => (
            <div key={s._id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <img src={s.image} alt={s.title} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{s.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" /> {s.from} - {s.to}
                </p>
                <div className="mt-1.5 flex items-center">
                  <div className="flex -space-x-2">
                    {[0, 1].map((i) => (
                      <img
                        key={i}
                        src={img(`sched-${s._id}-${i}`, 60, 60)}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover ring-2 ring-white"
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-[11px] font-medium text-emerald-600">+{s.people}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
