import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { img } from "../../../data/mockData";
import { EASE } from "./motion";

const lines = ["Chase the mist", "through the"];

const Bracket = ({ className }) => (
  <span aria-hidden className={`pointer-events-none absolute h-8 w-8 border-frost-50/25 ${className}`} />
);

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Layered scroll-linked scene — each plane moves at its own rate.
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.2]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.5, 0.9]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const hudOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex h-[100svh] min-h-[600px] w-full flex-col overflow-hidden bg-abyss-950"
    >
      {/* Photography plane */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 will-change-transform">
        <img
          src={img("hero-glacier", 2000, 1300)}
          alt="Glacial lake and misted peaks of Hazara"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </motion.div>

      {/* Legibility + cold-teal grade */}
      <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/35 to-abyss-950/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-abyss-950/75 via-transparent to-transparent" />
      {/* Glacier glow plane */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute -right-32 top-1/4 h-[36rem] w-[36rem] rounded-full bg-glacier-500/20 blur-[120px]"
      />

      {/* Viewfinder brackets */}
      <div className="section-x pointer-events-none absolute inset-0">
        <div className="relative h-full">
          <Bracket className="left-0 top-24 border-l-2 border-t-2" />
          <Bracket className="right-0 top-24 border-r-2 border-t-2" />
          <Bracket className="bottom-8 left-0 border-b-2 border-l-2" />
          <Bracket className="bottom-8 right-0 border-b-2 border-r-2" />
        </div>
      </div>

      {/* HUD: coordinates, cinematic */}
      <motion.div
        style={{ opacity: hudOpacity }}
        className="section-x pointer-events-none absolute inset-x-0 top-24 hidden items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.25em] text-frost-50/70 lg:flex"
      >
        <span>36.32°N &nbsp;74.65°E</span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-glacier-pulse rounded-full bg-glacier-400" />
          Live · Hunza valley
        </span>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="section-x relative mt-auto w-full pb-12 pt-28 sm:pb-16 sm:pt-32"
      >
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
            className="eyebrow-glacier"
          >
            Hazara · unfiltered
          </motion.p>

          <h1 className="mt-5 font-display text-[clamp(2.7rem,8vw,7.5rem)] font-bold leading-[0.92] tracking-[-0.03em] text-frost-50">
            {lines.map((ln, i) => (
              <span key={ln} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  initial={{ y: "115%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 1, ease: EASE }}
                  className="block"
                >
                  {ln}
                </motion.span>
              </span>
            ))}
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.45, duration: 1, ease: EASE }}
                className="block font-accent font-medium text-glacier-300"
              >
                high&nbsp;valleys.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: EASE }}
            className="mt-7 max-w-xl text-base leading-relaxed text-frost-200/85 sm:text-lg"
          >
            From the turquoise of Attabad Lake to the giants of Deosai — discover curated
            spots, book stays, and travel with guides who call these mountains home.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.7, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link to="/destinations" className="btn-glacier" data-cursor>
              Explore destinations <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/feedback" className="btn-outline-frost" data-cursor>
              Meet the guides
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll marker */}
      <motion.div
        style={{ opacity: hudOpacity }}
        className="absolute bottom-14 right-8 hidden flex-col items-center gap-3 lg:flex"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-frost-50/60 [writing-mode:vertical-rl]">
          Scroll
        </span>
        <span className="relative h-16 w-px overflow-hidden bg-frost-50/20">
          <motion.span
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 top-0 h-1/2 bg-glacier-400"
          />
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
