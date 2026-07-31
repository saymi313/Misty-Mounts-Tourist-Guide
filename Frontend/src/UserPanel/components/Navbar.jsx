import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ArrowUpRight, User, Heart, CalendarCheck, Bell, LogOut, ChevronRight, MessageSquare,
  Map as MapIcon, Route as RouteIcon, Languages, Bookmark,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import useTrip from "../../hooks/useTrip";
import { confirmDialog } from "../../utils/confirm";
import ProfileDropdown from "./ProfileDropdown";
import NotificationSystem from "../../components/NotificationSystem";
import { LIVE } from "../../data/api";
import { getUnreadMessageCount } from "../../data/messagesApi";

const links = [
  { to: "/user", key: "nav.home", label: "Home" },
  { to: "/destinations", key: "nav.destinations", label: "Destinations" },
  { to: "/guides", key: "nav.guides", label: "Local Guides" },
  { to: "/tours", key: "nav.tours", label: "Tours" },
  { to: "/map", key: "nav.map", label: "Map" },
  { to: "/feedback", key: "nav.feedback", label: "Feedback" },
  { to: "/about", key: "nav.about", label: "About" },
  { to: "/contact", key: "nav.contact", label: "Contact" },
];

const accountLinks = [
  { to: "/profile", key: "acct.profile", label: "Profile", icon: User },
  { to: "/messages", key: "acct.messages", label: "Messages", icon: MessageSquare },
  { to: "/wishlist", key: "acct.wishlist", label: "Wishlist", icon: Heart },
  { to: "/trip", key: "acct.trip", label: "My Trip", icon: RouteIcon },
  { to: "/saved", key: "acct.saved", label: "Saved spots", icon: Bookmark },
  { to: "/bookings", key: "acct.bookings", label: "My bookings", icon: CalendarCheck },
  { to: "/notifications", key: "acct.notifications", label: "Notifications", icon: Bell },
];

const EASE = [0.16, 1, 0.3, 1];

/** Shared navbar — floating glassmorphic bar, lime accent, glass mobile drawer. */
const Navbar = () => {
  const { user, logout, socket } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { items: tripItems } = useTrip();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const toggleLang = () => setLang(lang === "ur" ? "en" : "ur");

  // Live unread-message count for the Messages badge.
  useEffect(() => {
    if (!user || !LIVE) { setUnreadMsgs(0); return undefined; }
    const load = () => getUnreadMessageCount().then(setUnreadMsgs).catch(() => {});
    load();
    const onNew = ({ message }) => { if (!message?.mine) load(); };
    socket?.on("message:new", onNew);
    window.addEventListener("mm:messages-read", load);
    return () => {
      socket?.off("message:new", onNew);
      window.removeEventListener("mm:messages-read", load);
    };
  }, [user, socket, location.pathname]);

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (to) =>
    to === "/user" ? location.pathname === "/user" : location.pathname.startsWith(to);

  const initial = (user?.name || "U").charAt(0).toUpperCase();

  const handleLogout = async () => {
    const ok = await confirmDialog({
      title: "Sign out?",
      body: "You'll be signed out of your Misty Mounts account.",
      confirmLabel: "Sign out",
      danger: false,
    });
    if (!ok) return;
    logout();
    setMobileOpen(false);
    navigate("/auth");
  };

  return (
    <>
      <header className="sticky top-0 z-40">
        {/* soft scrim so page content fades under the floating bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-night-950/90 via-night-950/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pt-3 sm:px-6">
          <nav className="flex items-center justify-between gap-3 rounded-full border border-white/10 bg-night-900/50 px-3 py-2 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.06] backdrop-blur-xl sm:px-4">
            {/* Wordmark */}
            <Link to="/user" className="flex items-center gap-2.5 pl-1">
              <img src="/Logo.png" alt="Misty Mounts" className="h-9 w-9 rounded-xl object-cover shadow-[0_0_20px_-4px_rgba(163,230,53,0.6)]" />
              <span className="text-lg font-extrabold tracking-tight text-white">
                Misty<span className="text-lime-400">Mounts</span>
              </span>
            </Link>

            {/* Desktop links — full row only where there's room (xl+); the
                hamburger drawer covers everything below that so nothing overflows. */}
            <ul className="hidden min-w-0 items-center gap-0.5 xl:flex">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold transition-colors ${
                      isActive(l.to)
                        ? "bg-white/10 text-lime-400"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {t(l.key, l.label)}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language toggle (always) */}
              <button
                onClick={toggleLang}
                aria-label="Switch language"
                title={lang === "ur" ? "Switch to English" : "اردو میں دیکھیں"}
                className="hidden items-center gap-1 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                <Languages className="h-5 w-5" />
                <span className="text-xs font-bold">{lang === "ur" ? "EN" : "اردو"}</span>
              </button>
              {/* Trip builder (works logged-out too) */}
              <Link
                to="/trip"
                aria-label="My trip"
                className="relative hidden rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                <RouteIcon className="h-5 w-5" />
                {tripItems.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-400 px-1 text-[10px] font-bold text-night-950">
                    {tripItems.length > 9 ? "9+" : tripItems.length}
                  </span>
                )}
              </Link>
              {user && (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    to="/messages"
                    aria-label="Messages"
                    className="relative rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <MessageSquare className="h-5 w-5" />
                    {unreadMsgs > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-400 px-1 text-[10px] font-bold text-night-950">
                        {unreadMsgs > 9 ? "9+" : unreadMsgs}
                      </span>
                    )}
                  </Link>
                  <NotificationSystem />
                  <ProfileDropdown />
                </div>
              )}

              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10 xl:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile glass drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] xl:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-night-950/70 backdrop-blur-md"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
              className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto border-l border-white/10 bg-night-900/80 p-5 shadow-2xl backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-white">
                  <img src="/Logo.png" alt="Misty Mounts" className="h-9 w-9 rounded-xl object-cover" />
                  <span className="text-lg font-extrabold">
                    Misty<span className="text-lime-400">Mounts</span>
                  </span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Account card */}
              {user && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-400 font-bold text-night-950">
                      {initial}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{user?.name || "Traveller"}</p>
                    <p className="truncate text-xs text-white/50">{user?.email || ""}</p>
                  </div>
                </div>
              )}

              {/* Primary nav */}
              <nav className="mt-6">
                <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">{t("nav.explore", "Explore")}</p>
                  <button onClick={toggleLang} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-white/70 transition-colors hover:text-lime-400">
                    <Languages className="h-3.5 w-3.5" /> {lang === "ur" ? "English" : "اردو"}
                  </button>
                </div>
                <ul className="mt-1.5 space-y-0.5">
                  {links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className={`flex items-center justify-between rounded-2xl px-3 py-3 text-base font-bold transition-colors ${
                          isActive(l.to) ? "bg-lime-400/10 text-lime-400" : "text-white hover:bg-white/5"
                        }`}
                      >
                        {t(l.key, l.label)}
                        <ChevronRight className="h-4 w-4 opacity-40" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Account nav */}
              {user && (
                <nav className="mt-5 border-t border-white/8 pt-5">
                  <p className="px-2 text-xs font-bold uppercase tracking-wider text-white/40">Account</p>
                  <ul className="mt-1.5 space-y-0.5">
                    {accountLinks.map(({ to, key, label, icon: Icon }) => (
                      <li key={to}>
                        <Link
                          to={to}
                          className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                            isActive(to) ? "bg-lime-400/10 text-lime-400" : "text-white/75 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4 text-lime-400" /> <span className="flex-1">{t(key, label)}</span>
                          {to === "/messages" && unreadMsgs > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-400 px-1.5 text-xs font-bold text-night-950">
                              {unreadMsgs > 9 ? "9+" : unreadMsgs}
                            </span>
                          )}
                          {to === "/trip" && tripItems.length > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-400 px-1.5 text-xs font-bold text-night-950">
                              {tripItems.length > 9 ? "9+" : tripItems.length}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {/* Footer actions */}
              <div className="mt-auto space-y-3 pt-6">
                <Link
                  to="/destinations"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5"
                >
                  {t("cta.startExploring", "Start exploring")} <ArrowUpRight className="h-4 w-4" />
                </Link>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-500/30 px-6 py-3 text-sm font-bold text-rose-300 transition-colors hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" /> {t("cta.signOut", "Sign out")}
                  </button>
                )}
                <p className="pt-1 text-center text-xs text-white/40">Hazara, Pakistan · Local guides on call</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
