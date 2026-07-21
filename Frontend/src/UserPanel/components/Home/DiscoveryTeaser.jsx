import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { allPlaces } from "../../../data/mockData";
import { fadeUp, stagger, viewport } from "./motion";

const picks = [
  allPlaces.find((p) => p._id === "hunza-attabad"),
  allPlaces.find((p) => p._id === "skardu-deosai"),
  allPlaces.find((p) => p._id === "naran-saiful"),
  allPlaces.find((p) => p._id === "swat-mahodand"),
  allPlaces.find((p) => p._id === "fairy-meadows"),
].filter(Boolean);

const Card = ({ place, className = "", tall = false }) => (
  <motion.div variants={fadeUp} className={className}>
    <Link
      to={`/city/${encodeURIComponent(place.city)}/spot/${place._id}`}
      className="group relative block h-full overflow-hidden rounded-[1.75rem] ring-1 ring-abyss-900/10 dark:ring-frost-50/10"
    >
      <img
        src={place.picture}
        alt={place.name}
        className={`w-full object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.06] ${
          tall ? "h-full min-h-[420px]" : "h-full min-h-[220px]"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/92 via-abyss-950/15 to-transparent" />

      {place.hiddenGem && (
        <span className="absolute left-4 top-4 rounded-full bg-glacier-400 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-abyss-950">
          Hidden gem
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-glacier-300">
          {place.city}
        </p>
        <h3 className={`mt-1.5 font-display font-semibold text-frost-50 ${tall ? "text-3xl" : "text-xl"}`}>
          {place.name}
        </h3>
        {tall && (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-frost-200/90 line-clamp-2">
            {place.description}
          </p>
        )}

        {/* Content-tied hover: the spot's own elevation + best season slide in */}
        <div className="mt-3 flex items-center gap-3 text-xs text-frost-100 opacity-0 translate-y-1 transition-all duration-300 ease-editorial group-hover:opacity-100 group-hover:translate-y-0">
          {place.elevation && (
            <span className="tabular-nums">
              <span className="text-glacier-300">▲</span> {place.elevation}
            </span>
          )}
          {place.bestTime && (
            <span className="border-l border-frost-50/25 pl-3">Best · {place.bestTime}</span>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
);

const DiscoveryTeaser = () => {
  return (
    <section className="section-x py-[var(--space-section)]">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={stagger}
        className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
      >
        <motion.div variants={fadeUp}>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-glacier-700 dark:text-glacier-400">
            Begin with a valley
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.03] text-abyss-900 dark:text-frost-50 sm:text-5xl">
            Pick a valley. We'll show you where the{" "}
            <span className="font-accent font-medium text-glacier-600 dark:text-glacier-300">light falls.</span>
          </h2>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 rounded-full border border-abyss-900/15 px-5 py-2.5 text-sm font-semibold text-abyss-800 transition-colors hover:border-glacier-500 hover:text-glacier-700 dark:border-frost-50/20 dark:text-frost-100 dark:hover:border-glacier-400 dark:hover:text-glacier-300"
          >
            Browse all regions →
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={stagger}
        className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[224px]"
      >
        {picks[0] && <Card place={picks[0]} tall className="sm:col-span-2 lg:col-span-2 lg:row-span-2" />}
        {picks[1] && <Card place={picks[1]} />}
        {picks[2] && <Card place={picks[2]} />}
        {picks[3] && <Card place={picks[3]} className="sm:col-span-2 lg:col-span-3" />}
      </motion.div>
    </section>
  );
};

export default DiscoveryTeaser;
