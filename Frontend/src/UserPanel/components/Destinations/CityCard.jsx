import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, ArrowUpRight } from 'lucide-react';

const CityCard = ({ name, location, picture, city, spotId, hiddenGem, curatedBy }) => {
  return (
    <Link
      to={`/city/${encodeURIComponent(city)}/spot/${encodeURIComponent(spotId)}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-abyss-900/10 transition-all duration-300 ease-editorial hover:-translate-y-1 hover:shadow-lift dark:bg-abyss-900 dark:ring-frost-50/10"
    >
      <div className="relative overflow-hidden">
        <img
          src={picture}
          alt={name}
          className="h-56 w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {hiddenGem && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-glacier-400/95 px-2.5 py-1 text-xs font-semibold text-abyss-950 shadow-sm backdrop-blur">
            <Sparkles className="h-3 w-3" /> Hidden gem
          </span>
        )}
        <span className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/90 text-abyss-800 opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1 text-xs font-medium text-glacier-700 dark:text-glacier-300">
          <MapPin className="h-3.5 w-3.5" /> {location}
        </div>
        <h3 className="mt-1.5 font-display text-lg font-semibold text-abyss-900 dark:text-frost-50">{name}</h3>
        {curatedBy && (
          <p className="mt-auto pt-3 text-xs text-frost-500 dark:text-frost-400">
            Curated by <span className="font-medium text-glacier-700 dark:text-glacier-300">{curatedBy}</span>
          </p>
        )}
      </div>
    </Link>
  );
};

export default CityCard;
