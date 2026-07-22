import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { img } from "../../../data/mockData";
import { fadeUp, stagger, viewport } from "./motion";

const FinalCTA = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="section-x pb-[var(--space-section)] pt-4">
      <div className="relative flex min-h-[32rem] overflow-hidden rounded-[2.5rem] sm:min-h-[38rem]">
        <motion.img
          style={{ y, scale: 1.12 }}
          src={img("final-cta", 2000, 1300)}
          alt="Glacial valley at first light in Hazara"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-abyss-950/70 via-abyss-950/10 to-transparent" />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-[26rem] w-[26rem] rounded-full bg-glacier-500/15 blur-[120px]" />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={stagger}
          className="relative flex w-full flex-col justify-end p-8 sm:p-14 lg:p-20"
        >
          <motion.p variants={fadeUp} className="eyebrow-glacier">Your next trip</motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[0.98] text-frost-50 sm:text-7xl"
          >
            The mountains are{" "}
            <span className="font-accent font-medium text-glacier-300">waiting.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 max-w-lg text-lg text-frost-200">
            Start with a valley. We'll handle the rest — spots, stays, and a local who knows the way.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/destinations" className="btn-glacier" data-cursor>
              Explore destinations <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/feedback" className="btn-outline-frost" data-cursor>
              Talk to a guide
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
