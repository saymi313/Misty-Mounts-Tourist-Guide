// Shared Framer Motion variants so every landing section moves with one
// consistent, editorial cadence (no ad-hoc per-section animation).

const EASE = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: EASE } },
};

// Parent that staggers its children's reveals.
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

// Standard viewport trigger — reveal once, a bit before fully in view.
export const viewport = { once: true, amount: 0.25 };

export { EASE };
