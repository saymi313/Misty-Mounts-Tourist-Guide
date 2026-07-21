import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Mountain, CalendarRange, ChevronLeft, MessageCircle } from 'lucide-react';

const HeroSection = ({ spot }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

  if (!spot) return null;
  const { name, city, location, picture, elevation, bestTime, hiddenGem, curatedBy } = spot;

  return (
    <section ref={ref} className="relative h-[74vh] min-h-[480px] overflow-hidden">
      <motion.img
        style={{ y: imgY }}
        src={picture}
        alt={name}
        className="absolute inset-0 h-[116%] w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/45 to-night-950/10" />

      <div className="absolute inset-x-0 top-0 p-5 sm:p-8">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-lime-400/50 hover:text-lime-400"
        >
          <ChevronLeft className="h-4 w-4" /> All destinations
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 bottom-0 p-5 sm:p-10"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-night-800/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <MapPin className="h-3 w-3 text-lime-400" /> {city}
            </span>
            {hiddenGem && (
              <span className="inline-flex items-center gap-1 rounded-full bg-lime-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-night-950">
                Hidden gem
              </span>
            )}
          </div>

          <h1 className="mt-4 text-[clamp(2.6rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight text-white">
            {name}
          </h1>
          <p className="mt-3 flex items-center gap-1.5 text-white/70">
            <MapPin className="h-4 w-4 text-lime-400" /> {location}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {elevation && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur">
                <Mountain className="h-4 w-4 text-lime-400" /> {elevation}
              </span>
            )}
            {bestTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur">
                <CalendarRange className="h-4 w-4 text-lime-400" /> Best: {bestTime}
              </span>
            )}
            <Link
              to="/feedback"
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5 hover:bg-lime-300"
            >
              <MessageCircle className="h-4 w-4" /> Ask a local guide
            </Link>
          </div>

          {curatedBy && (
            <p className="mt-4 text-sm text-white/50">
              Curated by <span className="font-semibold text-lime-400">{curatedBy}</span>
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
