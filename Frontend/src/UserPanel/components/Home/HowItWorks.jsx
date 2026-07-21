import React from "react";
import { motion } from "framer-motion";
import { img } from "../../../data/mockData";
import { fadeUp, viewport, EASE } from "./motion";

const steps = [
  {
    n: "01",
    label: "Discover",
    title: "The north, valley by valley",
    body: "Start with a region and browse spots our local guides actually recommend — from famous lakes to the hidden corners you won't find on a map.",
    image: img("how-discover", 900, 700),
    caption: "Attabad Lake, Hunza",
  },
  {
    n: "02",
    label: "Plan",
    title: "Around the mountains, with a local",
    body: "Check weather windows, routes, and the best time to visit. Message a local guide in real time to shape the trip around what you actually want.",
    image: img("how-plan", 900, 700),
    caption: "Deosai Plains, Skardu",
  },
  {
    n: "03",
    label: "Book",
    title: "Stays, food & transport in one place",
    body: "Reserve boutique stays, riverside trout, and 4x4 transfers in a few taps — with free cancellation, all in one place.",
    image: img("how-book", 900, 700),
    caption: "Shangrila, Kachura",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-x py-[var(--space-section)]">
      <motion.div initial="hidden" whileInView="show" viewport={viewport} variants={fadeUp} className="max-w-2xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-glacier-700 dark:text-glacier-400">Planning, the local way</p>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.03] text-abyss-900 dark:text-frost-50 sm:text-5xl">
          From daydream to{" "}
          <span className="font-accent font-medium text-glacier-600 dark:text-glacier-300">itinerary,</span> in three steps.
        </h2>
      </motion.div>

      <div className="mt-16 space-y-16 lg:space-y-28">
        {steps.map((step, i) => {
          const flip = i % 2 === 1;
          return (
            <motion.div
              key={step.n}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={{ show: { transition: { staggerChildren: 0.15 } } }}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <motion.div variants={fadeUp} className={flip ? "lg:order-2 lg:pl-10" : "lg:pr-10"}>
                <div className="flex items-baseline gap-4 border-b border-abyss-900/10 pb-4 dark:border-frost-50/12">
                  <span className="font-display text-7xl font-bold leading-none text-glacier-300 dark:text-glacier-700">{step.n}</span>
                  <span className="text-sm font-semibold uppercase tracking-[0.24em] text-glacier-700 dark:text-glacier-400">{step.label}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold leading-[1.1] text-abyss-900 dark:text-frost-50 sm:text-[2.1rem]">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-frost-600 dark:text-frost-300">{step.body}</p>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.94, y: 30 },
                  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
                }}
                className={flip ? "lg:order-1" : ""}
              >
                <div className="group relative overflow-hidden rounded-[2rem] ring-1 ring-abyss-900/10 dark:ring-frost-50/10">
                  <img
                    src={step.image}
                    alt={step.caption}
                    className={`w-full object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.04] ${
                      flip ? "aspect-[5/4]" : "aspect-[4/3]"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/45 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-xs font-medium uppercase tracking-[0.16em] text-frost-100">
                    {step.caption}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
