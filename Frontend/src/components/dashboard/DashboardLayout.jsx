import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import RightRail from "./RightRail";

/**
 * Full dashboard shell used by both the Admin and Local Guide panels.
 * Sidebar | (Topbar + content) | optional RightRail.
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
  return (
    <div className="min-h-screen bg-[#f3f6f4] text-slate-800">
      <div className="mx-auto flex max-w-[1680px]">
        <Sidebar items={items} onLogout={onLogout} footerCard={footerCard} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar greeting={greeting} subtitle={subtitle} />
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
