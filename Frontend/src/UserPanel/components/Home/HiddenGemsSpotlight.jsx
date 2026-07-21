import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { allPlaces, img } from "../../../data/mockData";
import { fadeUp, stagger, viewport } from "./motion";

const gems = ["skardu-cold-desert", "hunza-eagles-nest", "gilgit-naltar"]
  .map((id) => allPlaces.find((p) => p._id === id))
  .filter(Boolean);

const HiddenGemsSpotlight = () => {
  return (
    <section className="relative overflow-hidden bg-frost-100 py-[var(--space-section)] text-abyss-900 dark:bg-abyss-900 dark:text-frost-100">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.07]">
        <img src={img("gems-texture", 1600, 900)} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-glacier-500/10 blur-[120px]" />

      <div className="section-x relative">
        <motion.div initial="hidden" whileInView="show" viewport={viewport} variants={stagger} className="max-w-3xl">
          <motion.p variants={fadeUp} className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-glacier-700 dark:text-glacier-400">
            Guide-curated · off the map
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-4 font-display text-4xl font-semibold leading-[1.02] text-abyss-900 dark:text-frost-50 sm:text-6xl"
          >
            The spots the crowds{" "}
            <span className="font-accent font-medium text-glacier-600 dark:text-glacier-300">never find.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 max-w-xl text-lg leading-relaxed text-frost-600 dark:text-frost-300">
            Every hidden gem here is personally chosen by a guide who lives in the valley —
            the quiet dune at dusk, the viewpoint before the tour buses, the lake beyond the road.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={stagger}
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {gems.map((gem, i) => (
            <motion.div key={gem._id} variants={fadeUp} className={i === 1 ? "md:mt-14" : i === 2 ? "md:mt-6" : ""}>
              <Link to={`/city/${encodeURIComponent(gem.city)}/spot/${gem._id}`} className="group block">
                <div className="relative overflow-hidden rounded-[1.75rem] ring-1 ring-abyss-900/10 dark:ring-frost-50/10">
                  <img
                    src={gem.picture}
                    alt={gem.name}
                    className="h-80 w-full object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/85 to-transparent" />
                  <span className="absolute right-4 top-4 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-glacier-400 text-abyss-950 opacity-0 transition-all duration-300 ease-editorial group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <span className="absolute left-4 top-4 rounded-full bg-abyss-950/55 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-frost-100">
                    {gem.city}
                  </span>
                </div>

                <div className="mt-5 flex items-start gap-3">
                  <img src={img(`guide-${i}`, 96, 96)} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-glacier-400/25" />
                  <div>
                    <h3 className="font-display text-xl font-semibold text-abyss-900 transition-colors group-hover:text-glacier-600 dark:text-frost-50 dark:group-hover:text-glacier-300">
                      {gem.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-frost-500 dark:text-frost-400">
                      Curated by {gem.curatedBy || "a local guide"}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HiddenGemsSpotlight;
