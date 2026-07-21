import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { feedbacks, allPlaces } from "../../../data/mockData";
import { fadeUp, stagger, viewport } from "./motion";

const placeById = Object.fromEntries(allPlaces.map((p) => [p._id, p]));
const reviewSpot = {
  "fb-1": "hunza-attabad",
  "fb-2": "skardu-deosai",
  "fb-3": "fairy-meadows",
  "fb-4": "naran-saiful",
  "fb-5": "swat-mahodand",
  "fb-6": "skardu-cold-desert",
};
const picFor = (r) => placeById[reviewSpot[r._id]]?.picture;

const featured = feedbacks[1];
const list = feedbacks.filter((r) => r._id !== featured._id).slice(0, 4);

const SocialProof = () => {
  const avg = (feedbacks.reduce((s, r) => s + r.rating, 0) / feedbacks.length).toFixed(1);

  return (
    <section className="relative overflow-hidden bg-frost-50 py-[var(--space-section)] dark:bg-abyss-950">
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-glacier-500/10 blur-[120px]" />
      <div className="section-x relative grid gap-10 lg:grid-cols-[0.8fr_2fr] lg:gap-16">
        {/* Aggregate panel */}
        <motion.div initial="hidden" whileInView="show" viewport={viewport} variants={stagger} className="lg:sticky lg:top-28 lg:self-start">
          <motion.p variants={fadeUp} className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-glacier-700 dark:text-glacier-400">Word from the trail</motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 font-display text-4xl font-semibold leading-[1.03] text-abyss-900 dark:text-frost-50 sm:text-5xl"
          >
            Real trips.{" "}
            <span className="font-accent font-medium text-glacier-600 dark:text-glacier-300">Honest words.</span>
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-5">
            <span className="font-display text-6xl font-bold text-abyss-900 dark:text-frost-50">{avg}</span>
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(avg)
                        ? "fill-glacier-400 text-glacier-400"
                        : "fill-abyss-900/15 text-abyss-900/15 dark:fill-frost-50/15 dark:text-frost-50/15"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-sm text-frost-500 dark:text-frost-400">
                across <span className="font-semibold text-glacier-600 dark:text-glacier-300">1,900+</span> traveller reviews
              </p>
            </div>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 max-w-xs text-frost-600 dark:text-frost-400">
            No paid placements, no stock quotes — just people who made the trip through the north.
          </motion.p>
        </motion.div>

        {/* Featured field-note over its spot, then a list */}
        <div>
          <motion.figure
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="relative overflow-hidden rounded-[2rem] ring-1 ring-abyss-900/10 dark:ring-frost-50/10"
          >
            <img src={picFor(featured)} alt={featured.locationName} className="h-[22rem] w-full object-cover sm:h-[26rem]" />
            <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/30 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
              <blockquote className="font-accent text-2xl font-medium leading-snug text-frost-50 sm:text-[2rem]">
                "{featured.message}"
              </blockquote>
              <div className="mt-5 flex items-center gap-3">
                <img src={featured.avatar} alt={featured.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-glacier-400/30" />
                <div>
                  <p className="text-sm font-semibold text-frost-50">{featured.name}</p>
                  <p className="text-xs text-glacier-300">{featured.locationName} · {featured.trip}</p>
                </div>
              </div>
            </figcaption>
          </motion.figure>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={stagger}
            className="mt-4 divide-y divide-abyss-900/10 border-t border-abyss-900/10 dark:divide-frost-50/12 dark:border-frost-50/12"
          >
            {list.map((r) => (
              <motion.div key={r._id} variants={fadeUp} className="flex gap-4 py-5">
                <img src={picFor(r)} alt={r.locationName} className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20" />
                <div className="min-w-0">
                  <p className="text-[15px] leading-relaxed text-frost-700 line-clamp-2 dark:text-frost-200">"{r.message}"</p>
                  <p className="mt-1.5 text-xs text-frost-500 dark:text-frost-400">
                    <span className="font-semibold text-abyss-900 dark:text-frost-100">{r.name}</span> · {r.locationName}
                    <span className="ml-2 whitespace-nowrap text-glacier-600 dark:text-glacier-300">★ {r.rating.toFixed(1)}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
