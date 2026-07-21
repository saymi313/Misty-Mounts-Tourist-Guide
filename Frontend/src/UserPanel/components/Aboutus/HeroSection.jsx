import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { img } from '../../../data/mockData';
import { Eyebrow } from '../bento/tiles';

const EASE = [0.16, 1, 0.3, 1];

// Full-bleed photo hero — big headline with a lime accent over a night gradient.
const HeroSection = () => {
  return (
    <div className="relative h-[62vh] min-h-[460px] w-full overflow-hidden">
      <motion.img
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.3, ease: EASE }}
        src={img('about-hero', 1600, 900)}
        alt="Northern Pakistan"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Night overlay so white text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/55 to-night-950/20" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-lime-400/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center"
      >
        <Eyebrow><Compass className="h-3.5 w-3.5" /> Our story</Eyebrow>
        <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-white text-balance">
          Built by locals,{" "}
          <span className="text-lime-400">for travellers.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-white/70">
          We started Misty Mounts to share the north the way locals know it — beyond the
          postcards, with the people, routes, and hidden corners that make it unforgettable.
        </p>
      </motion.div>
    </div>
  );
};

export default HeroSection;
