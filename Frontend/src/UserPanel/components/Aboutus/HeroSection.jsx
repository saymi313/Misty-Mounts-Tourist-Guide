import { motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Eyebrow } from '../bento/tiles';

const EASE = [0.16, 1, 0.3, 1];

// Full-bleed photo hero — big headline with a lime accent over a night gradient.
const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative min-h-[520px] w-full overflow-hidden sm:min-h-[580px]">
      <motion.img
        initial={reduceMotion ? false : { scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.3, ease: EASE }}
        src="/Naran.jpg"
        alt="Mountain landscape in Naran, Pakistan"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Night overlay so white text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/55 to-night-950/20" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-lime-400/20 blur-3xl" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        className="relative mx-auto flex min-h-[520px] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center sm:min-h-[580px]"
      >
        <Eyebrow><Heart className="h-3.5 w-3.5" /> Built with love for Pakistan</Eyebrow>
        <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-white text-balance">
          For the love of{" "}
          <span className="text-lime-400">Pakistan.</span>
        </h1>
        <p className="mt-5 text-lg font-semibold text-lime-200 sm:text-xl">An AI-powered travel experience for Pakistan.</p>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          We created Misty Mounts to promote Pakistani tourism. To help more people
          discover our homeland, experience our hospitality, and meet the communities
          who give every journey its meaning.
        </p>
        <p lang="ur" dir="rtl" className="mt-6 font-nastaliq text-lg leading-loose text-lime-200 sm:text-xl">پاکستان کی خوبصورتی، دنیا کے سامنے</p>
      </motion.div>
    </div>
  );
};

export default HeroSection;
