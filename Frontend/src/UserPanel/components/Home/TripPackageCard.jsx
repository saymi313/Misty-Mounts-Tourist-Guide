import React from "react";
import { Star, Quote, MapPin } from "lucide-react";

const TripPackageCard = ({ name, locationName, rating, message, avatar, trip }) => {
  return (
    <figure className="flex h-full flex-col rounded-3xl bg-white dark:bg-abyss-900 p-6 shadow-card ring-1 ring-abyss-900/10 dark:ring-frost-50/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "fill-glacier-400 text-glacier-400" : "fill-abyss-900/10 text-abyss-900/20 dark:fill-frost-50/15 dark:text-frost-50/15"
              }`}
            />
          ))}
        </div>
        <Quote className="h-6 w-6 text-glacier-500/20 dark:text-glacier-400/15" />
      </div>

      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-frost-700 dark:text-frost-200">
        "{message}"
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-abyss-900/8 dark:border-frost-50/8 pt-4">
        {avatar ? (
          <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-glacier-500/15 text-glacier-700 dark:bg-glacier-400/15 dark:text-glacier-300 font-display text-sm font-semibold">
            {(name || "?").charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-abyss-900 dark:text-frost-50">{name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-frost-500 dark:text-frost-400">
            <MapPin className="h-3 w-3" /> {locationName}
            {trip ? ` · ${trip}` : ""}
          </p>
        </div>
      </figcaption>
    </figure>
  );
};

export default TripPackageCard;
