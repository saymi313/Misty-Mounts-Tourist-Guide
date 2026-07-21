import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor for the landing page. A precise dot that tracks the pointer
 * exactly, plus a ring that lags behind on a spring and swells over links /
 * buttons. Uses mix-blend-difference so it stays visible on both the dark and
 * light sections. Only activates on fine (mouse) pointers with motion allowed.
 */
export default function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const spring = { stiffness: 350, damping: 28, mass: 0.4 };
  const rx = useSpring(x, spring);
  const ry = useSpring(y, spring);

  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const isInteractive = (t) => t && t.closest && t.closest("a,button,[data-cursor]");
    const over = (e) => isInteractive(e.target) && setActive(true);
    const out = (e) => isInteractive(e.target) && setActive(false);
    const leave = () => setHidden(true);
    const enter = () => setHidden(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mouseout", out, { passive: true });
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: rx, y: ry }}
        animate={{ scale: active ? 1.9 : 1, opacity: hidden ? 0 : 1 }}
        transition={{ scale: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.2 } }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-4 -mt-4 h-8 w-8 rounded-full border border-white mix-blend-difference"
      />
      <motion.div
        aria-hidden
        style={{ x, y }}
        animate={{ opacity: hidden || active ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
      />
    </>
  );
}
