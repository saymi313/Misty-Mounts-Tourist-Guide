import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mountain, CalendarRange, Sparkles, ChevronLeft, MessageCircle } from 'lucide-react';

const HeroSection = ({ spot }) => {
  if (!spot) return null;
  const { name, city, location, picture, elevation, bestTime, hiddenGem, curatedBy } = spot;

  return (
    <section className="relative h-[70vh] min-h-[460px] overflow-hidden">
      <img src={picture} alt={name} className="h-full w-full object-cover animate-slow-zoom" />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/45 to-abyss-950/20" />

      <div className="absolute inset-x-0 top-0 p-5 sm:p-8">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-1.5 rounded-full bg-frost-50/15 px-3.5 py-2 text-sm font-medium text-frost-50 backdrop-blur transition-colors hover:bg-frost-50/25"
        >
          <ChevronLeft className="h-4 w-4" /> All destinations
        </Link>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-abyss-800/80 px-3 py-1 text-xs font-medium text-frost-50 backdrop-blur">
              <MapPin className="h-3 w-3" /> {city}
            </span>
            {hiddenGem && (
              <span className="inline-flex items-center gap-1 rounded-full bg-glacier-400 px-3 py-1 text-xs font-semibold text-abyss-950">
                <Sparkles className="h-3 w-3" /> Hidden gem
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-4xl font-semibold text-frost-50 sm:text-6xl">
            {name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-frost-200">
            <MapPin className="h-4 w-4" /> {location}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {elevation && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-frost-50/10 px-3.5 py-2 text-sm text-frost-50 backdrop-blur">
                <Mountain className="h-4 w-4 text-glacier-300" /> {elevation}
              </span>
            )}
            {bestTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-frost-50/10 px-3.5 py-2 text-sm text-frost-50 backdrop-blur">
                <CalendarRange className="h-4 w-4 text-glacier-300" /> Best: {bestTime}
              </span>
            )}
            <Link to="/feedback" className="btn-sun ml-auto">
              <MessageCircle className="h-4 w-4" /> Ask a local guide
            </Link>
          </div>

          {curatedBy && (
            <p className="mt-4 text-sm text-frost-300">
              Curated by <span className="font-medium text-glacier-300">{curatedBy}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
