import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight, Star } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const MotionLink = motion.create(Link);

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, delay, ease: EASE },
});

const GLOWS = {
  lime: "bg-lime-400/25",
  green: "bg-green-500/25",
  sky: "bg-sky-500/25",
};

/** Base bento tile: dark elevated surface, rounded, reveals on scroll. */
export const Tile = ({ className = "", children, delay = 0, glow, pad = "p-5" }) => (
  <motion.div
    {...reveal(delay)}
    className={`relative overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-night-800 ${pad} ${className}`}
  >
    {glow && <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ${GLOWS[glow]}`} />}
    <div className="relative h-full">{children}</div>
  </motion.div>
);

/**
 * Photo bento tile — a linked image with a gradient overlay, title, meta and an
 * arrow that appears on hover (cinematic zoom + reveal).
 */
export const PhotoTile = ({ image, to = "/destinations", title, meta, badge, className = "", delay = 0 }) => (
  <MotionLink
    to={to}
    {...reveal(delay)}
    className={`group relative block overflow-hidden rounded-[1.4rem] border border-white/[0.07] ${className}`}
  >
    <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.07]" />
    <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/25 to-transparent" />
    {badge && (
      <span className="absolute left-3 top-3 rounded-full bg-lime-400 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-night-950">
        {badge}
      </span>
    )}
    <span className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <ArrowUpRight className="h-4 w-4" />
    </span>
    <div className="absolute inset-x-0 bottom-0 p-4">
      {meta && (
        <p className="flex items-center gap-1 text-xs font-medium text-lime-300">
          <MapPin className="h-3 w-3" /> {meta}
        </p>
      )}
      <h3 className="mt-0.5 text-lg font-extrabold leading-tight text-white">{title}</h3>
    </div>
  </MotionLink>
);

/** Small eyebrow label. */
export const Eyebrow = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-lime-400 ${className}`}>
    {children}
  </span>
);

/* ── Shared kit for interior pages (same night + lime language) ──────────── */

/** Section header: eyebrow + title (+ optional action). */
export const SectionHead = ({ eyebrow, title, icon: Icon, action, className = "" }) => (
  <div className={`mb-5 flex items-end justify-between gap-4 ${className}`}>
    <div>
      {eyebrow && <Eyebrow>{Icon && <Icon className="h-3.5 w-3.5" />} {eyebrow}</Eyebrow>}
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h2>
    </div>
    {action}
  </div>
);

/** Lime pill button. */
export const Btn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-night-950 transition-all hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none disabled:opacity-60 ${className}`}
    {...props}
  >
    {children}
  </button>
);

/** Outline button on dark. */
export const BtnGhost = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-lime-400 hover:text-lime-400 focus:outline-none ${className}`}
    {...props}
  >
    {children}
  </button>
);

/** Pill / chip. `active` fills it lime. */
export const Chip = ({ children, active, className = "", ...props }) => (
  <button
    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-lime-400 text-night-950" : "border border-white/12 bg-night-800 text-white/70 hover:border-lime-400/50 hover:text-white"
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

/** Shared input class for dark forms. */
export const inputCls =
  "w-full rounded-2xl border border-white/10 bg-night-800 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-lime-400/60";

/** Star rating row (amber-lime). */
export const Stars = ({ value = 0, className = "" }) => (
  <span className={`inline-flex gap-0.5 ${className}`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < value ? "fill-lime-400 text-lime-400" : "fill-white/15 text-white/15"}`} />
    ))}
  </span>
);
