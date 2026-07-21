import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Menu, X, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import NotificationSystem from "../../components/NotificationSystem";
import { img } from "../../data/mockData";

const links = [
  { to: "/user", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/feedback", label: "Guides & Reviews" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const EASE = [0.16, 1, 0.3, 1];

/** Shared navbar — matches the bento landing: dark night bar, lime accent. */
const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (to) =>
    to === "/user" ? location.pathname === "/user" : location.pathname.startsWith(to);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-night-950/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          {/* Wordmark */}
          <Link to="/user" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-night-950">
              <Mountain className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Misty<span className="text-lime-400">Mounts</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`text-sm font-semibold transition-colors ${
                    isActive(l.to) ? "text-lime-400" : "text-white/70 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/destinations"
              className="hidden items-center gap-1.5 rounded-full bg-lime-400 px-4 py-2 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Explore <ArrowUpRight className="h-4 w-4" />
            </Link>

            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <NotificationSystem />
                <ProfileDropdown />
              </div>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-night-950">
              <img src={img("nav-mobile", 900, 1400)} alt="" className="h-full w-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-night-950/70 via-night-950/85 to-night-950" />
            </div>
            <div className="relative flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-night-950">
                    <Mountain className="h-5 w-5" strokeWidth={2.4} />
                  </span>
                  <span className="text-lg font-extrabold">Misty Mounts</span>
                </span>
                <button onClick={() => setMobileOpen(false)} className="rounded-xl p-2 text-white hover:bg-white/10" aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
                className="mt-auto space-y-1"
              >
                {links.map((l) => (
                  <motion.li key={l.to} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}>
                    <Link to={l.to} className="block border-b border-white/10 py-4 text-4xl font-extrabold text-white transition-colors hover:text-lime-400">
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5, ease: EASE }} className="mt-10">
                <Link to="/destinations" className="flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3.5 text-sm font-bold text-night-950">
                  Start exploring <ArrowUpRight className="h-4 w-4" />
                </Link>
                <p className="mt-6 text-sm text-white/40">Gilgit-Baltistan, Pakistan · Local guides on call</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
