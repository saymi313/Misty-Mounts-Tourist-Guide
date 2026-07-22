import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain, Menu, X, ArrowUpRight, User, Heart, CalendarCheck, Bell, LogOut, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import NotificationSystem from "../../components/NotificationSystem";

const links = [
  { to: "/user", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/feedback", label: "Guides & Reviews" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const accountLinks = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/saved", label: "Saved spots", icon: Heart },
  { to: "/bookings", label: "My bookings", icon: CalendarCheck },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const EASE = [0.16, 1, 0.3, 1];

/** Shared navbar — floating glassmorphic bar, lime accent, glass mobile drawer. */
const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (to) =>
    to === "/user" ? location.pathname === "/user" : location.pathname.startsWith(to);

  const initial = (user?.name || "U").charAt(0).toUpperCase();

  const handleLogout = () => {
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
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-night-950 shadow-[0_0_20px_-4px_rgba(163,230,53,0.6)]">
                <Mountain className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Misty<span className="text-lime-400">Mounts</span>
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-1 lg:flex">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive(l.to)
                        ? "bg-white/10 text-lime-400"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {user && (
                <div className="hidden items-center gap-2 sm:flex">
                  <NotificationSystem />
                  <ProfileDropdown />
                </div>
              )}

              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
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
          <div className="fixed inset-0 z-[60] lg:hidden">
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
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-night-950">
                    <Mountain className="h-5 w-5" strokeWidth={2.4} />
                  </span>
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
                <p className="px-2 text-xs font-bold uppercase tracking-wider text-white/40">Explore</p>
                <ul className="mt-1.5 space-y-0.5">
                  {links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className={`flex items-center justify-between rounded-2xl px-3 py-3 text-base font-bold transition-colors ${
                          isActive(l.to) ? "bg-lime-400/10 text-lime-400" : "text-white hover:bg-white/5"
                        }`}
                      >
                        {l.label}
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
                    {accountLinks.map(({ to, label, icon: Icon }) => (
                      <li key={to}>
                        <Link
                          to={to}
                          className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                            isActive(to) ? "bg-lime-400/10 text-lime-400" : "text-white/75 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4 text-lime-400" /> {label}
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
                  Start exploring <ArrowUpRight className="h-4 w-4" />
                </Link>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-500/30 px-6 py-3 text-sm font-bold text-rose-300 transition-colors hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                )}
                <p className="pt-1 text-center text-xs text-white/40">Gilgit-Baltistan, Pakistan · Local guides on call</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
