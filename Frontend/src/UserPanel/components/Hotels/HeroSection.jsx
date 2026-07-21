import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ChevronLeft, Utensils, BedDouble } from 'lucide-react';
import { Stars } from '../bento/tiles';

const EASE = [0.16, 1, 0.3, 1];

const HeroSection = ({ hotel = {} }) => {
  const { name, picture, location, rating, reviews, tags = [], type } = hotel;
  const isFood = type === 'food';

  return (
    <section>
      <Link
        to="/destinations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition-colors hover:text-lime-400"
      >
        <ChevronLeft className="h-4 w-4" /> Back to destinations
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative overflow-hidden rounded-[1.4rem] border border-white/[0.07]"
      >
        <img src={picture} alt={name} className="h-[46vh] min-h-[320px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400 px-3 py-1 text-xs font-bold text-night-950">
              {isFood ? <Utensils className="h-3 w-3" /> : <BedDouble className="h-3 w-3" />}
              {isFood ? 'Food & café' : 'Stay'}
            </span>
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {t}
              </span>
            ))}
          </div>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">{name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-white/80">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-lime-400" /> {location}
            </span>
            {rating && (
              <span className="flex items-center gap-2">
                <Stars value={Math.round(rating)} />
                <span className="font-bold text-white">{rating}</span>
                {reviews ? <span className="text-white/50">({reviews} reviews)</span> : null}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
