import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
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
      <Contour className="pointer-events-none absolute -bottom-4 left-0 h-56 w-full text-lime-900" opacity={0.05} />

      {/* Brand */}
      <div className="relative flex items-center gap-2.5 px-2">
        <img src="/Logo.png" alt="Misty Mounts" className="h-9 w-9 rounded-xl object-cover" />
        <span className="font-display text-lg font-bold tracking-tight text-slate-900">Misty Mounts</span>
      </div>

      {/* Nav */}
      <nav className="relative mt-9 flex flex-1 flex-col gap-1.5">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-lime-400 text-night-950 shadow-lg shadow-lime-400/25"
                  : "text-slate-500 hover:bg-lime-50 hover:text-lime-700"
              }`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {badge > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
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
