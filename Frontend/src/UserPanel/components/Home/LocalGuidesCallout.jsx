import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Check } from "lucide-react";
import { img } from "../../../data/mockData";
import { fadeUp, stagger, viewport, EASE } from "./motion";

const bubbles = [
  { from: "guide", text: "Salaam! Heading to Hunza? Aim for a sunrise boat on Attabad — calmest water, best light." },
  { from: "you", text: "Love that. Is the Babusar road open this week?" },
  { from: "guide", text: "Open since Tuesday. I'll send you a 6-day plan with Passu Cones included." },
];

const LocalGuidesCallout = () => {
  return (
    <section className="section-x py-[var(--space-section)]">
      <div className="overflow-hidden rounded-[2.5rem] bg-sand-100 ring-1 ring-sand-300/50 dark:bg-abyss-900 dark:ring-frost-50/10">
        <div className="grid items-stretch gap-0 lg:grid-cols-2">
          {/* Portrait + chat preview */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="relative min-h-[420px] overflow-hidden"
          >
            <img src={img("guide-portrait", 900, 1100)} alt="A local guide in Hunza" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/50 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-sand-100/30 dark:lg:to-abyss-900/40" />

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={stagger}
              className="absolute bottom-5 left-5 right-5 space-y-2"
            >
              {bubbles.map((b, i) => (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 16, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } } }}
                  className={`flex ${b.from === "you" ? "justify-end" : "justify-start"}`}
                >
                  <span
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-lift ${
                      b.from === "you"
                        ? "rounded-br-md bg-abyss-800 text-frost-50"
                        : "rounded-bl-md bg-white text-abyss-900"
                    }`}
                  >
                    {b.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={stagger}
            className="flex flex-col justify-center p-8 sm:p-12 lg:p-16"
          >
            <motion.p variants={fadeUp} className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-glacier-700 dark:text-glacier-400">
              People, not itineraries
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-4 font-display text-4xl font-semibold leading-[1.03] text-abyss-900 dark:text-frost-50 sm:text-5xl"
            >
              A local guide, a{" "}
              <span className="font-accent font-medium text-glacier-600 dark:text-glacier-300">message away.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 text-lg leading-relaxed text-frost-700 dark:text-frost-300">
              Behind every valley is someone who grew up there. Chat in real time about weather
              windows, road conditions, and the meals worth the detour — then have them plan it
              with you.
            </motion.p>

            <motion.ul variants={fadeUp} className="mt-7 space-y-3">
              {["Real-time answers on routes & weather", "Guide-built itineraries around your pace", "Honest tips on where to stay and eat"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-abyss-900 dark:text-frost-100">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-glacier-500 text-abyss-950">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[15px]">{t}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} className="mt-9">
              <Link to="/feedback" className="btn-glacier" data-cursor>
                <MessageCircle className="h-4 w-4" /> Chat with a guide
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocalGuidesCallout;
