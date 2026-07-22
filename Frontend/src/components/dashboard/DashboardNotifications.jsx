import React, { useEffect, useRef, useState } from "react";
import {
  Bell, X, Check, CheckCheck, Trash2,
  CalendarCheck, MessageSquare, AlertTriangle, Tag, Star,
} from "lucide-react";
import {
  getNotifications, subscribeNotifications, fetchNotifications, unreadCountOf,
  markRead, markAllRead, removeNotification,
} from "../../utils/notificationsStore";
import { timeAgo } from "../../utils/datetime";

// Type → icon + tinted chip. Uses the same light utility palette as the rest of
// the dashboard, so the `.mm-night` layer re-themes it automatically.
const META = {
  booking: { icon: CalendarCheck, cls: "bg-lime-50 text-lime-600" },
  guide: { icon: MessageSquare, cls: "bg-sky-50 text-sky-600" },
  message: { icon: MessageSquare, cls: "bg-sky-50 text-sky-600" },
  alert: { icon: AlertTriangle, cls: "bg-amber-50 text-amber-600" },
  price: { icon: Tag, cls: "bg-lime-50 text-lime-600" },
  review: { icon: Star, cls: "bg-amber-50 text-amber-600" },
  system: { icon: Bell, cls: "bg-slate-100 text-slate-500" },
};

/**
 * Dashboard notification bell — a real, wired dropdown for the Admin and Local
 * Guide panels. Backed by the shared notificationsStore (localStorage cache +
 * live API when the backend is connected), so mark-read / remove stay in sync
 * with the user panel bell and the /notifications page.
 */
export default function DashboardNotifications() {
  const [items, setItems] = useState(getNotifications);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetchNotifications();
    return subscribeNotifications(() => setItems([...getNotifications()]));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = unreadCountOf(items);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-lime-600"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-lime-400 text-[11px] font-bold text-night-950 ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-400">{unread > 0 ? `${unread} unread` : "You're all caught up"}</p>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-lime-600 transition-colors hover:bg-lime-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[22rem] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-400">No notifications yet</div>
            ) : (
              items.slice(0, 10).map((n) => {
                const meta = META[n.type] || META.system;
                const Icon = meta.icon;
                return (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50 ${!n.read ? "bg-lime-50/50" : ""}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.cls}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />}
                        <p className="truncate text-sm font-semibold text-slate-900">{n.title}</p>
                        <span className="ml-auto shrink-0 text-[11px] text-slate-400">{timeAgo(n.time)}</span>
                      </div>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.body}</p>}
                      <div className="mt-1.5 flex items-center gap-3">
                        {!n.read && (
                          <button
                            onClick={() => markRead(n._id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-lime-600 transition-colors hover:text-lime-700"
                          >
                            <Check className="h-3 w-3" /> Mark read
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(n._id)}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-rose-500"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
