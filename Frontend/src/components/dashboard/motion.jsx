import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];
const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Staggered container — reveals children on mount. */
export const Stagger = ({ children, className = "", delay = 0 }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="show"
    variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
  >
    {children}
  </motion.div>
);

/** A single revealing item (use inside Stagger, or standalone). */
export const Reveal = ({ children, className = "" }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 16 },
      show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
    }}
  >
    {children}
  </motion.div>
);

/**
 * Count a number up from 0 → value on mount. Formats with a prefix/suffix.
 * Respects reduced-motion (jumps to the final value).
 */
export function useCountUp(value, { duration = 1100, decimals = 0 } = {}) {
  const [n, setN] = useState(reduced() ? value : 0);
  const raf = useRef(null);

  useEffect(() => {
    if (reduced()) { setN(value); return; }
    const start = performance.now();
    const from = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (value - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return decimals ? n.toFixed(decimals) : Math.round(n);
}

/** Tiny inline area sparkline (SVG) — for the featured stat. */
export const Sparkline = ({ data = [], stroke = "#10b981", fill = "rgba(16,185,129,0.14)", w = 120, h = 40 }) => {
  if (!data.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / span) * (h - 6) - 3]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
