import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import RightRail from "./RightRail";

/**
 * Full dashboard shell used by both the Admin and Local Guide panels.
 * Sidebar | (Topbar + content) | optional RightRail.
 *
 * Owns the panel day/night theme: a `.mm-night` class on the shell flips the
 * whole panel to the night + lime palette (see index.css), persisted so the
 * choice survives reloads and is shared across admin + guide.
 */
export default function DashboardLayout({
  items,
  onLogout,
  footerCard,
  greeting,
  subtitle,
  user,
  schedule,
  rightRail = false,
  children,
}) {
  const [night, setNight] = useState(() => {
    try { return localStorage.getItem("mm-panel-theme") === "night"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("mm-panel-theme", night ? "night" : "day"); } catch { /* ignore */ }
    // Mirror onto <body> so portaled popups (modals, toasts, confirm dialogs)
    // rendered outside this shell can theme with the panel. Cleared when the
    // panel unmounts (e.g. navigating to the traveller app).
    document.body.classList.toggle("mm-night", night);
    return () => document.body.classList.remove("mm-night");
  }, [night]);

  return (
    <div className={`min-h-screen ${night ? "mm-night bg-night-950 text-slate-200" : "bg-[#f3f6f4] text-slate-800"}`}>
      <div className="mx-auto flex max-w-[1680px]">
        <Sidebar items={items} onLogout={onLogout} footerCard={footerCard} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            greeting={greeting}
            subtitle={subtitle}
            night={night}
            onToggleNight={() => setNight((v) => !v)}
          />
          <div className="flex flex-1 gap-6 px-6 pb-8">
            <main className="min-w-0 flex-1">{children}</main>
            {rightRail && (
              <aside className="hidden w-[22rem] shrink-0 2xl:block">
                <RightRail user={user} schedule={schedule} />
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
