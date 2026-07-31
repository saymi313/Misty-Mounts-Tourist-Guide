import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring, useMotionTemplate,
} from "framer-motion";
import Lenis from "lenis";
import {
  ArrowUpRight, ArrowRight, Star, MessageCircle, Compass, MapPin, Quote, ChevronDown,
  ShieldCheck, Users, Flag, Volume2, VolumeX,
} from "lucide-react";
import { allPlaces, feedbacks as mockFeedbacks, img } from "../../data/mockData";
import { getFeedbacks } from "../../data/mockApi";
import { useCountUp } from "../../components/dashboard/motion";
import { Eyebrow } from "../components/bento/tiles";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";

const EASE = [0.16, 1, 0.3, 1];
const byId = (id) => allPlaces.find((p) => p._id === id);
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Scroll-linked useTransform inputs must stay within [0,1] — framer accelerates
// them via WAAPI, whose keyframe offsets are rejected outside that range.
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/* ── Film grain + scroll-progress bar ───────────────────────────────────── */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";
const Grain = () => (
  <div className="pointer-events-none fixed inset-0 z-[5] opacity-[0.06] mix-blend-soft-light" style={{ backgroundImage: GRAIN }} />
);
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-300" />;
};

/* ── Parallax image that drifts inside its frame ────────────────────────── */
const ParallaxImage = ({ src, alt = "", className = "", intensity = 14, children, overlay = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${intensity}%`, `${intensity}%`]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img style={{ y }} src={src} alt={alt} className="absolute inset-0 h-[135%] w-full object-cover" />
      {overlay && <div className={overlay} />}
      {children}
    </div>
  );
};

/* ── In-view count-up ───────────────────────────────────────────────────── */
const CountVal = ({ value, decimals }) => {
  const n = useCountUp(value, { decimals });
  return <>{decimals ? n : Number(n).toLocaleString()}</>;
};
const Counter = ({ value, decimals = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return <span ref={ref}>{inView ? <CountVal value={value} decimals={decimals} /> : decimals ? (0).toFixed(decimals) : 0}</span>;
};

const Reveal = ({ children, className = "", delay = 0, y = 28 }) => (
  <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay, ease: EASE }}>
    {children}
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════════════════
   HERO — layered parallax (scroll + mouse depth) + kinetic headline
   ═════════════════════════════════════════════════════════════════════════ */
// The hero's second line cycles through destinations — breadth without a wall of text.
const HERO_WORDS = ["Hunza.", "Skardu.", "Deosai.", "Naran.", "Swat.", "the north."];
const RotatingWord = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced()) return undefined;
    const id = setInterval(() => setI((x) => (x + 1) % HERO_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block whitespace-nowrap">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={i}
          className="inline-block bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 bg-clip-text text-transparent"
          initial={{ y: "0.5em", opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-0.5em", opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {HERO_WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
// Button that magnetically eases toward the cursor on hover (micro-interaction).
const MagneticButton = ({ to, className, children }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
  const onMove = (e) => {
    if (reduced() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ x: sx, y: sy }} className="inline-block">
      <Link to={to} className={className}>{children}</Link>
    </motion.div>
  );
};

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Cursor "torch": a radial mask that reveals the vivid photo under the pointer
  // and also drives parallax depth. Fractions 0–1 across the section.
  const tx = useMotionValue(0.62);
  const ty = useMotionValue(0.42);
  const stx = useSpring(tx, { stiffness: 140, damping: 24 });
  const sty = useSpring(ty, { stiffness: 140, damping: 24 });
  const maskX = useTransform(stx, (v) => `${(v * 100).toFixed(2)}%`);
  const maskY = useTransform(sty, (v) => `${(v * 100).toFixed(2)}%`);
  const torch = useMotionTemplate`radial-gradient(circle at ${maskX} ${maskY}, #000 0%, #000 16%, transparent 50%)`;
  const depthFar = useTransform(stx, [0, 1], [16, -16]);
  const depthFarY = useTransform(sty, [0, 1], [10, -10]);
  const depthNear = useTransform(stx, [0, 1], [-22, 22]);
  const depthNearY = useTransform(sty, [0, 1], [-12, 12]);
  const orbX = useTransform(stx, [0, 1], [40, -40]);

  const onMove = (e) => {
    if (reduced() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    tx.set((e.clientX - r.left) / r.width);
    ty.set((e.clientY - r.top) / r.height);
  };

  return (
    <section ref={ref} onMouseMove={onMove} className="relative -mt-[68px] flex min-h-[100svh] items-center overflow-hidden pt-24">
      {/* Dimmed base + vivid layer revealed by the cursor torch */}
      <motion.img style={{ y: bgY, scale: bgScale }} src="/L1.jpg" alt="Northern Pakistan" className="absolute inset-0 h-full w-full object-cover brightness-[0.5] saturate-[0.8]" />
      <motion.img aria-hidden style={{ y: bgY, scale: bgScale, WebkitMaskImage: torch, maskImage: torch }} src="/L1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />

      {/* Light legibility scrims (kept subtle so the torch still reads) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night-950/75 via-night-950/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-night-950 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night-950/60 to-transparent" />
      <motion.div style={{ x: orbX }} className="pointer-events-none absolute -left-24 top-1/4 h-[32rem] w-[32rem] rounded-full bg-lime-400/15 blur-[130px]" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-8">
        <motion.div style={{ x: depthFar, y: depthFarY }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
              </span>
              Pakistan's north · unfiltered
            </span>
          </motion.div>

          <h1 className="mt-5 font-future uppercase text-[clamp(2rem,6.5vw,5rem)] font-black leading-[0.98] tracking-tight text-white [text-shadow:0_6px_40px_rgba(0,0,0,0.45)]">
            <motion.span className="block" initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: EASE }}>
              Explore
            </motion.span>
            <span className="block"><RotatingWord /></span>
          </h1>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55 }} className="mt-8 flex flex-wrap gap-3">
            <MagneticButton to="/destinations" className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-7 py-3.5 text-sm font-bold text-night-950 shadow-[0_10px_40px_-8px_rgba(163,230,53,0.6)] transition-colors hover:bg-lime-300">
              Explore destinations <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton to="/tours" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition-colors hover:border-lime-400 hover:text-lime-400">
              Browse tours
            </MagneticButton>
          </motion.div>

          <motion.div style={{ x: depthNear, y: depthNearY }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }} className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-lime-400" /> Escrow-protected</span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-lime-400" /> Verified guides</span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-lime-400" /> 4.8 · 1,900+ reviews</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Engineer-y coordinate detail */}
      <div className="pointer-events-none absolute bottom-7 right-7 z-10 hidden text-right font-mono text-[11px] leading-relaxed text-white/45 sm:block">
        <p>36.3172° N · 74.6500° E</p>
        <p className="text-lime-400/70">◆ HUNZA VALLEY · 2,438 M</p>
      </div>

      {/* Scroll cue */}
      <motion.div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-1 text-white/50" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Scroll to begin</span>
        <ChevronDown className="h-4 w-4" />
      </motion.div>
    </section>
  );
};

/* ══ Infinite marquee ══════════════════════════════════════════════════════ */
const Marquee = ({ items }) => (
  <div className="relative overflow-hidden border-y border-white/[0.06] bg-night-900/50 py-5">
    <motion.div className="flex w-max gap-10 whitespace-nowrap pr-10" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }}>
      {[...items, ...items].map((name, i) => (
        <span key={i} className="flex items-center gap-10 text-2xl font-extrabold tracking-tight text-white/25">
          {name} <Star className="h-4 w-4 fill-lime-400/60 text-lime-400/60" />
        </span>
      ))}
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   ASCENT — the scroll IS a hike. Layered SVG mountains parallax past, a trail
   draws upward with a climbing hiker, the sun rises, a cloud-sea drops away, an
   altitude gauge ticks up, and waypoint "chapters" tell the story. Fully
   self-contained art — swap the ridge/sky layers for photography later.
   ═════════════════════════════════════════════════════════════════════════ */
const TRAIL_D = "M 50 97 C 40 89 61 85 50 77 C 42 70 59 66 50 58 C 43 51 58 47 50 39 C 44 32 57 28 50 20 C 45 14 55 10 50 3";

const WAYPOINTS = [
  { at: 0.12, n: "01", icon: Compass, label: "Discover the valleys" },
  { at: 0.40, n: "02", icon: Users, label: "Guided by locals" },
  { at: 0.68, n: "03", icon: ShieldCheck, label: "Booked with trust" },
  { at: 0.95, n: "04", icon: Flag, label: "Reach the summit", to: "/destinations", cta: "Start your journey" },
];

// Minimal, cinematic chapter marker — a giant numeral + a three-word line.
const Waypoint = ({ wp, progress }) => {
  const w = 0.16;
  const opacity = useTransform(progress, [clamp01(wp.at - w), clamp01(wp.at - w * 0.4), clamp01(wp.at + w * 0.4), clamp01(wp.at + w)], [0, 1, 1, 0]);
  const y = useTransform(progress, [clamp01(wp.at - w), clamp01(wp.at + w)], [50, -50]);
  const Icon = wp.icon;
  return (
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-5 sm:gap-8 sm:px-8">
        <span className="font-sans text-[clamp(4.5rem,17vw,14rem)] font-black leading-[0.8] text-white/10">{wp.n}</span>
        <div className="pointer-events-auto">
          <Icon className="h-7 w-7 text-lime-400" />
          <h2 className="mt-3 font-sans text-[clamp(1.9rem,6vw,4.5rem)] font-extrabold leading-[1.0] tracking-tight text-white">{wp.label}</h2>
          {wp.cta && (
            <Link to={wp.to} className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime-400 px-7 py-3.5 text-sm font-bold text-night-950 shadow-[0_10px_40px_-8px_rgba(163,230,53,0.5)] transition-transform hover:-translate-y-0.5">
              {wp.cta} <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Live altitude read-out (throttled to 10 m steps to avoid render spam).
const AltitudeHUD = ({ progress }) => {
  const [alt, setAlt] = useState(1200);
  useEffect(() => {
    const set = (v) => { const a = Math.round((1200 + v * (4411 - 1200)) / 10) * 10; setAlt((p) => (p !== a ? a : p)); };
    set(progress.get());
    return progress.on("change", set);
  }, [progress]);
  return (
    <div className="absolute right-5 top-24 z-20 rounded-2xl border border-white/10 bg-night-950/50 px-4 py-2.5 backdrop-blur">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime-400">Altitude</p>
      <p className="font-sans text-xl font-extrabold tabular-nums text-white">{alt.toLocaleString()} m</p>
    </div>
  );
};

const SNOW = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 53) % 100,
  size: 2 + (i % 3),
  dur: 7 + (i % 6),
  delay: (i % 12) * 0.6,
  dx: `${(i % 2 ? 1 : -1) * (8 + (i % 5) * 6)}px`,
}));

// Inline hiker silhouette — backpack + trekking pole, mid-stride (uses currentColor).
const HikerFigure = ({ className = "" }) => (
  <svg viewBox="0 0 32 40" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="17" cy="6" r="3.2" fill="currentColor" stroke="none" />
    <rect x="9" y="10" width="7" height="11" rx="2.5" fill="currentColor" stroke="none" opacity="0.85" />
    <path d="M16 10 L18 22" />
    <path d="M18 22 L22 31 L24 38" />
    <path d="M18 22 L14 30 L11 37" />
    <path d="M17 14 L23 18" />
    <path d="M23 12 L26 38" strokeWidth="2" opacity="0.9" />
  </svg>
);

// Real mountain photos (in /public), cross-fading as you gain altitude.
const PHOTOS = ["/L2.jpg", "/L3.jpg", "/L4.jpeg"];
const PhotoLayer = ({ src, progress, index, total }) => {
  const seg = 1 / total;
  const c = (index + 0.5) * seg;
  const oIn = [index === 0 ? 0 : clamp01(c - seg * 0.6), clamp01(c - seg * 0.3), clamp01(c + seg * 0.3), index === total - 1 ? 1 : clamp01(c + seg * 0.6)];
  const oOut = [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0];
  const opacity = useTransform(progress, oIn, oOut);
  const scale = useTransform(progress, [clamp01(c - seg), clamp01(c + seg)], [1.25, 1.05]);
  const y = useTransform(progress, [clamp01(c - seg), clamp01(c + seg)], ["-4%", "4%"]);
  return <motion.img style={{ opacity, scale, y }} src={src} alt="" className="absolute inset-0 h-[112%] w-full object-cover" />;
};

// A climber that walks the trail path; `offset` places trailing companions.
// The figure turns to face the trail's direction on each switchback.
const Climber = ({ pathRef, progress, offset = 0, lead = false }) => {
  const left = useMotionValue("50%");
  const top = useMotionValue("97%");
  const flip = useMotionValue(1);
  const flipS = useSpring(flip, { stiffness: 130, damping: 20 });
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return undefined;
    const len = p.getTotalLength();
    const set = (v) => {
      const t = clamp01(v + offset);
      const pt = p.getPointAtLength(t * len);
      left.set(`${pt.x}%`);
      top.set(`${pt.y}%`);
      const ahead = p.getPointAtLength(Math.min(len, (t + 0.012) * len));
      const dx = ahead.x - pt.x;
      if (Math.abs(dx) > 0.03) flip.set(dx > 0 ? 1 : -1);
    };
    set(progress.get());
    return progress.on("change", set);
  }, [pathRef, progress, offset, left, top, flip]);
  return (
    <motion.div style={{ left, top }} className="absolute z-10 -translate-x-1/2 -translate-y-full">
      {lead && <span className="absolute left-1/2 top-1/2 -z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/40 blur-md" />}
      <motion.div style={{ scaleX: flipS }}>
        <HikerFigure className={lead ? "h-9 w-9 text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.9)]" : "h-6 w-6 text-white/60"} />
      </motion.div>
    </motion.div>
  );
};

/** Manual, Lenis-proof pinned-section progress (0→1) driven by a rAF loop that
 *  reads the section's real position — no reliance on framer's scroll timeline. */
const usePinProgress = (ref) => {
  const progress = useMotionValue(0);
  useEffect(() => {
    let raf;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const dist = Math.max(1, rect.height - window.innerHeight);
        const scrolled = Math.min(Math.max(-rect.top, 0), dist);
        progress.set(scrolled / dist);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ref, progress]);
  return progress;
};

const Ascent = () => {
  const ref = useRef(null);
  const progress = usePinProgress(ref);

  // Atmosphere layered over the real photo backdrops.
  const darkenOp = useTransform(progress, [0, 1], [0.15, 0.55]);
  const cloudY = useTransform(progress, [0, 1], ["0%", "45%"]);
  const cloudOp = useTransform(progress, [0, 0.7], [0.85, 0.06]);
  const snowOp = useTransform(progress, [0.5, 0.72], [0, 1]);
  const flagOp = useTransform(progress, [0.9, 1], [0, 1]);
  const draw = useTransform(progress, (v) => 1 - v);
  const cueOp = useTransform(progress, [0, 0.06], [1, 0]);

  const pathRef = useRef(null);

  return (
    <section ref={ref} id="ascent" className="relative h-[480vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#060d0b]">
        <style>{`
          @keyframes mm-snow{0%{transform:translate3d(0,-8%,0);opacity:0}12%{opacity:.9}100%{transform:translate3d(var(--dx),108vh,0);opacity:0}}
          @keyframes mm-fog{0%{transform:translateX(-5%)}100%{transform:translateX(5%)}}
        `}</style>

        {/* Real mountain photos (L2→L3→L4) cross-fading as you climb */}
        {PHOTOS.map((src, i) => <PhotoLayer key={i} src={src} progress={progress} index={i} total={PHOTOS.length} />)}

        {/* Photo mood: darken toward the summit + top scrim for the HUD */}
        <motion.div style={{ opacity: darkenOp }} className="pointer-events-none absolute inset-0 bg-night-950" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-night-950/70 to-transparent" />

        {/* Drifting mist — the misty mounts */}
        <motion.div style={{ y: cloudY, opacity: cloudOp }} className="pointer-events-none absolute inset-x-0 top-[52%]">
          <div className="mx-auto h-24 w-[130%] -translate-x-[12%] rounded-[50%] bg-white/25 blur-2xl" style={{ animation: "mm-fog 24s ease-in-out infinite alternate" }} />
          <div className="mx-auto -mt-14 h-20 w-[100%] rounded-[50%] bg-white/14 blur-2xl" style={{ animation: "mm-fog 32s ease-in-out infinite alternate-reverse" }} />
        </motion.div>

        {/* Trail */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          <path d={TRAIL_D} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.4" strokeDasharray="0.6 1.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          <motion.path ref={pathRef} d={TRAIL_D} fill="none" stroke="#a3e635" strokeWidth="2" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw }} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        </svg>

        {/* Trekking party */}
        <Climber pathRef={pathRef} progress={progress} lead />
        <Climber pathRef={pathRef} progress={progress} offset={-0.03} />
        <Climber pathRef={pathRef} progress={progress} offset={-0.055} />

        {/* Summit flag */}
        <motion.div style={{ opacity: flagOp }} className="absolute left-1/2 top-[3%] z-10 -translate-x-1/2 -translate-y-full">
          <Flag className="h-6 w-6 text-lime-400" style={{ filter: "drop-shadow(0 0 10px rgba(163,230,53,0.8))" }} />
        </motion.div>

        {/* Falling snow (higher up) */}
        <motion.div style={{ opacity: snowOp }} className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {SNOW.map((s, i) => <span key={i} className="absolute top-0 rounded-full bg-white" style={{ left: `${s.left}%`, width: s.size, height: s.size, "--dx": s.dx, animation: `mm-snow ${s.dur}s linear ${s.delay}s infinite` }} />)}
        </motion.div>

        {/* Legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night-950/75 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-night-950 to-transparent" />

        {/* HUD */}
        <AltitudeHUD progress={progress} />
        <div className="absolute left-5 top-1/2 z-20 hidden h-56 w-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/10 sm:block">
          <motion.div style={{ scaleY: progress }} className="h-full w-full origin-bottom bg-gradient-to-t from-lime-400 to-emerald-300" />
        </div>

        {/* Waypoint chapters */}
        {WAYPOINTS.map((wp) => <Waypoint key={wp.tag} wp={wp} progress={progress} />)}

        {/* Scroll cue */}
        <motion.div style={{ opacity: cueOp }} className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-1 text-white/60">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Start the climb</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   TRAIL — pinned horizontal gallery that scrolls sideways as you scroll down
   ═════════════════════════════════════════════════════════════════════════ */
const Trail = ({ items }) => {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [range, setRange] = useState(0);
  const progress = usePinProgress(ref);
  const x = useTransform(progress, [0, 1], [0, -range]);

  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (el) setRange(Math.max(0, el.scrollWidth - window.innerWidth));
    };
    measure();
    const t = setTimeout(measure, 300);
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("resize", measure); clearTimeout(t); };
  }, [items]);

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 w-full max-w-[1400px] px-5 sm:px-8">
          <Eyebrow><Compass className="h-3.5 w-3.5" /> Chapter 04 · The trail</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-sans text-[clamp(1.8rem,4.5vw,3.4rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            Six valleys, <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">one journey.</span>
          </h2>
        </div>
        <motion.div ref={trackRef} style={{ x }} className="flex gap-5 px-[6vw]">
          {items.map((p) => (
            <Link
              key={p._id}
              to={`/city/${encodeURIComponent(p.city)}/spot/${p._id}`}
              className="group relative h-[62vh] w-[80vw] shrink-0 overflow-hidden rounded-[1.6rem] border border-white/[0.07] sm:w-[46vw] lg:w-[34vw] xl:w-[440px]"
            >
              <img src={p.picture} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/25 to-transparent" />
              {p.hiddenGem && <span className="absolute left-5 top-5 rounded-full bg-lime-400 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-night-950">Hidden gem</span>}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="flex items-center gap-1 text-xs font-medium text-lime-300"><MapPin className="h-3 w-3" /> {p.city}{p.elevation ? ` · ${p.elevation}` : ""}</p>
                <h3 className="mt-1 text-2xl font-extrabold leading-tight text-white">{p.name}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-lime-400 opacity-0 transition-opacity group-hover:opacity-100">View spot <ArrowRight className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
          {/* Closing CTA card */}
          <Link to="/tours" className="group relative flex h-[62vh] w-[80vw] shrink-0 flex-col justify-center overflow-hidden rounded-[1.6rem] border border-lime-400/30 bg-gradient-to-br from-lime-400/15 to-emerald-500/5 p-8 sm:w-[46vw] lg:w-[34vw] xl:w-[420px]">
            <Eyebrow>Your journey</Eyebrow>
            <h3 className="mt-3 text-3xl font-extrabold leading-tight text-white">Ready-made group tours, sorted.</h3>
            <p className="mt-2 text-sm text-white/70">Itineraries, stays and transport bundled by local travel agencies.</p>
            <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-night-950 transition-transform group-hover:-translate-y-0.5">Browse tours <ArrowUpRight className="h-4 w-4" /></span>
          </Link>
        </motion.div>
        <p className="mx-auto mt-8 w-full max-w-[1400px] px-5 text-xs text-white/30 sm:px-8">Keep scrolling — the trail moves with you →</p>
      </div>
    </section>
  );
};

/* ══ Stats band ════════════════════════════════════════════════════════════ */
const STATS = [
  { value: 6, label: "Valleys covered" },
  { value: 120, suffix: "+", label: "Curated spots" },
  { value: 24, label: "Local guides" },
  { value: 4.8, decimals: 1, label: "Avg. rating" },
];
const StatsBand = () => (
  <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-night-900/60 px-6 py-12 sm:px-12">
    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
    <div className="relative grid grid-cols-2 gap-8 md:grid-cols-4">
      {STATS.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08} className="text-center">
          <div className="font-sans text-[clamp(2.5rem,6vw,4rem)] font-extrabold tracking-tight text-white">
            <Counter value={s.value} decimals={s.decimals || 0} /><span className="text-lime-400">{s.suffix || ""}</span>
          </div>
          <div className="mt-1 text-sm text-white/55">{s.label}</div>
        </Reveal>
      ))}
    </div>
  </section>
);

/* ══ Reviews ═══════════════════════════════════════════════════════════════ */
const Reviews = ({ reviews }) => (
  <section>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <Reveal>
        <Eyebrow><Star className="h-3.5 w-3.5" /> Word from the trail</Eyebrow>
        <h2 className="mt-3 max-w-xl text-[clamp(1.9rem,4.5vw,3.2rem)] font-extrabold leading-[1.03] tracking-tight text-white">
          Loved by <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">travellers.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="flex items-center gap-3">
        <span className="font-sans text-5xl font-black leading-none text-white sm:text-6xl">4.8</span>
        <div>
          <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, s) => <Star key={s} className="h-4 w-4 fill-lime-400 text-lime-400" />)}</div>
          <p className="mt-1 text-xs text-white/50">1,900+ reviews</p>
        </div>
      </Reveal>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {reviews.slice(0, 3).map((r, i) => (
        <Reveal key={r._id} delay={i * 0.1}>
          <div className="flex h-full flex-col rounded-[1.4rem] border border-white/[0.07] bg-night-900/60 p-6 transition-colors hover:border-lime-400/30">
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`h-3.5 w-3.5 ${s < (r.rating || 5) ? "fill-lime-400 text-lime-400" : "fill-white/10 text-white/10"}`} />)}</div>
              <Quote className="h-6 w-6 text-lime-400/30" />
            </div>
            <p className="mt-4 flex-1 text-[15px] font-medium leading-relaxed text-white/85 line-clamp-4">“{r.message}”</p>
            <div className="mt-5 flex items-center gap-2.5 border-t border-white/[0.06] pt-4">
              {r.avatar ? <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400/15 text-sm font-extrabold text-lime-400">{(r.name || "?").charAt(0)}</span>}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{r.name || "Traveller"}</p>
                <p className="truncate text-xs text-white/50">{r.locationName || "Northern Pakistan"}</p>
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

/* ══ Final CTA ═════════════════════════════════════════════════════════════ */
const FinalCTA = () => (
  <section>
    <ParallaxImage src="/Hunza.jpg" intensity={16} className="rounded-[2rem] border border-white/[0.07]" overlay="absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/70 to-night-950/30">
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />
      <div className="relative px-6 py-20 sm:px-16 sm:py-28">
        <Reveal>
          <Eyebrow>The last chapter is yours</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-sans text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[1.0] tracking-tight text-white">
            The mountains are <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">waiting.</span>
          </h2>
          <p className="mt-4 max-w-lg text-white/70">Start with a valley — we'll handle the spots, stays and a local who knows the way.</p>
          <Link to="/destinations" className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime-400 px-8 py-4 text-sm font-bold text-night-950 shadow-[0_10px_40px_-8px_rgba(163,230,53,0.5)] transition-transform hover:-translate-y-0.5">
            Begin your journey <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </ParallaxImage>
  </section>
);

/* ══ Page ══════════════════════════════════════════════════════════════════ */
// Mute-by-default mountain ambience (browsers block autoplay; user opts in).
// Drop a loopable clip at /public/ambience.mp3 to enable it.
const AmbientSound = () => {
  const audioRef = useRef(null);
  const [on, setOn] = useState(false);
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (on) { a.pause(); setOn(false); }
    else { a.volume = 0.35; a.play().then(() => setOn(true)).catch(() => setOn(false)); }
  };
  return (
    <>
      <audio ref={audioRef} src="/ambience.mp3" loop preload="none" />
      <button
        onClick={toggle}
        aria-label={on ? "Mute ambience" : "Play mountain ambience"}
        title={on ? "Mute ambience" : "Mountain ambience"}
        className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-night-900/70 text-white/80 shadow-lg backdrop-blur transition-colors hover:border-lime-400 hover:text-lime-400"
      >
        {on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
    </>
  );
};

const LandingPage = () => {
  const dest = ["skardu-deosai", "naran-saiful", "swat-mahodand", "fairy-meadows", "gilgit-naltar"].map(byId).filter(Boolean);
  const gems = ["skardu-cold-desert", "hunza-eagles-nest", "gilgit-naltar"].map(byId).filter(Boolean);
  const trail = [...new Map([...dest, ...gems].map((p) => [p._id, p])).values()];
  const marquee = ["Hunza", "Skardu", "Naran", "Fairy Meadows", "Deosai", "Swat", "Gilgit", "Chitral", "Kaghan", "Attabad"];

  const [reviews, setReviews] = useState(mockFeedbacks.slice(0, 3));
  useEffect(() => {
    getFeedbacks()
      .then((res) => {
        const real = (res?.feedbacks || []).filter((r) => !r.guideId);
        if (real.length) setReviews(real.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const lenisRef = useRef(null);
  useEffect(() => {
    if (reduced()) return undefined;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    let id;
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); lenisRef.current = null; };
  }, []);

  // Auto-advance the ascent once it reaches the top: a self-playing preview of
  // the climb that hands control back the instant the visitor scrolls/taps.
  useEffect(() => {
    if (reduced()) return undefined;
    const section = document.getElementById("ascent");
    if (!section) return undefined;
    let done = false;

    const stopAuto = () => {
      const l = lenisRef.current;
      if (l) { try { l.scrollTo(window.scrollY, { immediate: true }); } catch { /* ignore */ } }
      removeUser();
    };
    const removeUser = () => {
      window.removeEventListener("wheel", stopAuto);
      window.removeEventListener("touchstart", stopAuto);
      window.removeEventListener("keydown", stopAuto);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (done || !entries[0].isIntersecting) return;
        done = true;
        io.disconnect();
        // Skip if the visitor is already mid-climb (e.g. reloaded deep in).
        if (section.getBoundingClientRect().top < -40) return;
        const l = lenisRef.current;
        const target = section.offsetTop + section.offsetHeight - window.innerHeight;
        window.addEventListener("wheel", stopAuto, { passive: true });
        window.addEventListener("touchstart", stopAuto, { passive: true });
        window.addEventListener("keydown", stopAuto);
        if (l) l.scrollTo(target, { duration: 8, easing: (t) => t, onComplete: removeUser });
      },
      { rootMargin: "0px 0px -92% 0px" } // fire as the section's top nears the viewport top
    );
    io.observe(section);
    return () => { io.disconnect(); removeUser(); };
  }, []);

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <ScrollProgress />
      <Grain />
      <AmbientSound />
      <Navbar />
      <Hero />
      <Marquee items={marquee} />
      <Ascent />
      <Trail items={trail} />
      <main className="mx-auto max-w-[1400px] space-y-20 px-4 py-20 sm:space-y-28 sm:px-6 sm:py-28">
        <StatsBand />
        <Reviews reviews={reviews} />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
