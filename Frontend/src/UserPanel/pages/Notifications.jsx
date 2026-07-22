import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CalendarCheck, MessageSquare, AlertTriangle, Tag, Star,
  Check, CheckCheck, Trash2, Compass,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Btn, Chip } from "../components/bento/tiles";
import {
  getNotifications, subscribeNotifications, fetchNotifications,
  markRead as nMarkRead, markAllRead as nMarkAll, removeNotification as nRemove,
} from "../../utils/notificationsStore";
import { timeAgo } from "../../utils/datetime";

const EASE = [0.16, 1, 0.3, 1];
const FILTERS = ["All", "Unread"];

const typeMeta = {
  booking: { icon: CalendarCheck, cls: "bg-lime-400/15 text-lime-300" },
  guide: { icon: MessageSquare, cls: "bg-sky-400/15 text-sky-300" },
  alert: { icon: AlertTriangle, cls: "bg-amber-400/15 text-amber-300" },
  price: { icon: Tag, cls: "bg-emerald-400/15 text-emerald-300" },
  review: { icon: Star, cls: "bg-amber-400/15 text-amber-300" },
  system: { icon: Bell, cls: "bg-white/10 text-white/70" },
};

const Notifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(getNotifications);
  const [filter, setFilter] = useState("All");

  // Fetch from the API (live) and stay in sync with the navbar bell (shared store).
  useEffect(() => {
    fetchNotifications();
    return subscribeNotifications(() => setItems([...getNotifications()]));
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const shown = filter === "Unread" ? items.filter((n) => !n.read) : items;

  const markRead = (id) => nMarkRead(id);
  const markAll = () => nMarkAll();
  const remove = (id) => nRemove(id);

  const open = (n) => {
    markRead(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <Eyebrow><Bell className="h-3.5 w-3.5" /> Updates</Eyebrow>
            <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              Notifications
            </h1>
            <p className="mt-3 text-lg text-white/70">
              {unread > 0 ? `You have ${unread} unread update${unread > 1 ? "s" : ""}.` : "You're all caught up."}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-lime-400 hover:text-lime-400"
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </motion.div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f} <span className="ml-1 opacity-60">{f === "Unread" ? unread : items.length}</span>
            </Chip>
          ))}
        </div>

        {/* List */}
        {shown.length === 0 ? (
          <Tile className="mt-6 flex flex-col items-center justify-center py-16 text-center" pad="p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-night-700 text-lime-400">
              <Bell className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-extrabold text-white">
              {filter === "Unread" ? "Nothing unread" : "No notifications"}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-white/60">
              Booking updates, guide replies and weather alerts will appear here.
            </p>
            <Link to="/destinations" className="mt-6">
              <Btn><Compass className="h-4 w-4" /> Start exploring</Btn>
            </Link>
          </Tile>
        ) : (
          <div className="mt-6 space-y-2.5">
            <AnimatePresence mode="popLayout">
              {shown.map((n, i) => {
                const meta = typeMeta[n.type] || typeMeta.system;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={n._id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, delay: i * 0.03, ease: EASE }}
                    onClick={() => open(n)}
                    className={`group flex cursor-pointer items-start gap-4 rounded-[1.3rem] border p-4 transition-colors sm:p-5 ${
                      n.read
                        ? "border-white/[0.06] bg-night-800 hover:border-white/15"
                        : "border-lime-400/20 bg-lime-400/[0.04] hover:border-lime-400/40"
                    }`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.cls}`}>
                      <Icon className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-lime-400" />}
                        <p className="truncate text-sm font-bold text-white">{n.title}</p>
                        <span className="ml-auto shrink-0 text-xs text-white/40">{timeAgo(n.time)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{n.body}</p>

                      <div className="mt-2 flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(n._id); }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-lime-400 hover:text-lime-300"
                          >
                            <Check className="h-3.5 w-3.5" /> Mark read
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); remove(n._id); }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-white/40 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
