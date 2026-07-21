import React from "react";
import { Quote, MapPin } from "lucide-react";
import { Tile, Stars } from "../bento/tiles";

/** Night review tile for the reviews bento — quote, lime stars, avatar, name, location. */
const TripPackageCard = ({ name, locationName, rating, message, avatar, trip, delay = 0, glow, className = "" }) => (
  <Tile delay={delay} glow={glow} pad="p-6" className={`h-full ${className}`}>
    <figure className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <Stars value={rating} />
        <Quote className="h-6 w-6 text-lime-400/30" />
      </div>

      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-white/70">
        "{message}"
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.07] pt-4">
        {avatar ? (
          <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400/15 text-sm font-extrabold text-lime-400">
            {(name || "?").charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-white/50">
            <MapPin className="h-3 w-3 shrink-0" /> {locationName}
            {trip ? ` · ${trip}` : ""}
          </p>
        </div>
      </figcaption>
    </figure>
  </Tile>
);

export default TripPackageCard;
