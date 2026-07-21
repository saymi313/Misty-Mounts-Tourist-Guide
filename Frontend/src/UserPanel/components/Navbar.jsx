import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Mountain, Menu, X, ArrowUpRight, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
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

/**
 * @param {boolean} overlay  Landing mode: transparent over the cinematic hero,
 *   transitions to a dark glacial glass on scroll, always light (frost) text.
 *   When false, the bar is the interior light theme (unchanged).
 */
const Navbar = ({ overlay = false }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 32));
  useEffect(() => { setScrolled(window.scrollY > 32); }, []);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Light (frost) text over the dark hero/glass on landing, or in dark theme.
  const lightText = overlay || theme === "dark";
  const showGlass = overlay ? scrolled : true;

  const bg = overlay
    ? scrolled ? "rgba(5,19,26,0.72)" : "rgba(5,19,26,0)"
    : theme === "dark" ? "rgba(5,19,26,0.72)" : "rgba(247,248,248,0.82)";
  const borderColor = overlay
    ? scrolled ? "rgba(19,58,68,0.6)" : "rgba(19,58,68,0)"
    : theme === "dark" ? "rgba(19,58,68,0.6)" : "rgba(219,224,224,0.8)";

  const isActive = (to) =>
    to === "/user" ? location.pathname === "/user" : location.pathname.startsWith(to);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ backgroundColor: bg, borderColor, backdropFilter: showGlass ? "blur(14px)" : "blur(0px)" }}
        transition={{ duration: 0.4, ease: EASE }}
        className={`${overlay ? "fixed" : "sticky"} inset-x-0 top-0 z-50 border-b`}
      >
        <nav className="section-x flex items-center justify-between py-4">
          {/* Wordmark */}
          <Link to="/user" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-glacier-400 text-abyss-950 transition-colors duration-300">
              <Mountain className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span
              className={`font-display text-xl font-semibold tracking-tight transition-colors duration-300 ${
                lightText ? "text-frost-50" : "text-abyss-900"
              }`}
            >
              Misty<span className={lightText ? "text-glacier-300" : "text-glacier-600"}>Mounts</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  data-active={isActive(l.to)}
                  className={`nav-link ${
                    lightText
                      ? "text-frost-50/80 hover:text-frost-50 focus-visible:ring-glacier-300/60"
                      : "text-abyss-700 hover:text-abyss-950 focus-visible:ring-glacier-400"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                lightText
                  ? "text-frost-50/80 hover:bg-white/10 hover:text-frost-50"
                  : "text-abyss-700 hover:bg-abyss-900/5 hover:text-abyss-950"
              }`}
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            <Link
              to="/destinations"
              className="hidden items-center gap-1.5 rounded-full bg-glacier-400 px-5 py-2.5 text-sm font-semibold text-abyss-950 transition-all duration-300 ease-editorial hover:-translate-y-0.5 hover:bg-glacier-300 sm:inline-flex"
            >
              Explore <ArrowUpRight className="h-4 w-4" />
            </Link>

            {!overlay && user && (
              <div className="hidden items-center gap-2 sm:flex">
                <NotificationSystem />
                <ProfileDropdown />
              </div>
            )}

            {/* Mobile trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className={`rounded-xl p-2 transition-colors lg:hidden ${
                lightText ? "text-frost-50 hover:bg-white/10" : "text-abyss-800 hover:bg-abyss-900/5"
              }`}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* ── Mobile full-screen overlay (glacial) ───────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-abyss-950">
              <img src={img("nav-mobile", 900, 1400)} alt="" className="h-full w-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-abyss-950/70 via-abyss-950/85 to-abyss-950" />
            </div>

            <div className="relative flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-frost-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-glacier-400 text-abyss-950">
                    <Mountain className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <span className="font-display text-xl font-semibold">Misty Mounts</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl p-2 text-frost-100 hover:bg-white/10"
                  aria-label="Close menu"
                >
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
                  <motion.li
                    key={l.to}
                    variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
                  >
                    <Link
                      to={l.to}
                      className="block border-b border-white/10 py-4 font-display text-4xl font-medium text-frost-50 transition-colors hover:text-glacier-300"
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
                className="mt-10"
              >
                <Link to="/destinations" className="btn-glacier w-full">
                  Start exploring <ArrowUpRight className="h-4 w-4" />
                </Link>
                <p className="mt-6 text-sm text-frost-400">Gilgit-Baltistan, Pakistan · Local guides on call</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
