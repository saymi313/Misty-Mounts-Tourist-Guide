import React from "react";
import { NavLink } from "react-router-dom";
import { Mountain, LogOut } from "lucide-react";
import { Contour } from "./ui";

/**
 * Dashboard sidebar (reference-style): brand, nav with an emerald active pill,
 * an optional footer card, and logout. Shared by the Admin and Guide panels.
 *
 * @param {Array<{to:string,label:string,icon:React.ComponentType,end?:boolean}>} items
 */
export default function Sidebar({ items = [], onLogout, footerCard = null }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden bg-white px-5 py-7 lg:flex">
      {/* Topographic brand texture (mountain contours) */}
      <Contour className="pointer-events-none absolute -bottom-4 left-0 h-56 w-full text-emerald-900" opacity={0.05} />

      {/* Brand */}
      <div className="relative flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
          <Mountain className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-slate-900">Misty Mounts</span>
      </div>

      {/* Nav */}
      <nav className="relative mt-9 flex flex-1 flex-col gap-1.5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      {footerCard && <div className="relative mb-4">{footerCard}</div>}

      <button
        onClick={onLogout}
        className="relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
      >
        <LogOut className="h-[18px] w-[18px]" /> Log out
      </button>
    </aside>
  );
}
