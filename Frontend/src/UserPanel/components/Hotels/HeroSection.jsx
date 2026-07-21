import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ChevronLeft, Utensils, BedDouble } from 'lucide-react';

const HeroSection = ({ hotel = {} }) => {
  const { name, picture, location, rating, reviews, tags = [], type } = hotel;
  const isFood = type === 'food';

  return (
    <section>
      <Link
        to="/destinations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-frost-600 hover:text-abyss-800 dark:text-frost-300 dark:hover:text-frost-100"
      >
        <ChevronLeft className="h-4 w-4" /> Back to destinations
      </Link>

      <div className="relative overflow-hidden rounded-[2rem] shadow-card ring-1 ring-abyss-900/10 dark:ring-frost-50/10">
        <img src={picture} alt={name} className="h-[46vh] min-h-[320px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/80 via-abyss-950/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-abyss-800 backdrop-blur">
              {isFood ? <Utensils className="h-3 w-3" /> : <BedDouble className="h-3 w-3" />}
              {isFood ? 'Food & café' : 'Stay'}
            </span>
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-abyss-800/70 px-3 py-1 text-xs font-medium text-frost-100 backdrop-blur">
                {t}
              </span>
            ))}
          </div>

          <h1 className="mt-3 font-display text-3xl font-semibold text-frost-50 sm:text-5xl">{name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-frost-200">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {location}
            </span>
            {rating && (
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-glacier-400 text-glacier-400" />
                <span className="font-semibold text-frost-50">{rating}</span>
                {reviews ? <span className="text-frost-300">({reviews} reviews)</span> : null}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
