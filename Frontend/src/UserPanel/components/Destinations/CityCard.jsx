import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const MotionLink = motion.create(Link);

/**
 * Night bento spot card — a linked PhotoTile in the bento landing language:
 * full-bleed image with a dark gradient, a lime hidden-gem badge, location meta,
 * an optional "curated by" credit and a hover zoom + arrow reveal.
 *
 * Height/span is driven by the `className` passed from the bento grid so it can
 * act as either the big featured tile or a smaller one.
 */
const CityCard = ({
  name,
  location,
  picture,
  city,
  spotId,
  hiddenGem,
  curatedBy,
  className = "min-h-[200px]",
  delay = 0,
}) => (
  <MotionLink
    to={`/city/${encodeURIComponent(city)}/spot/${encodeURIComponent(spotId)}`}
    initial={{ opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6, delay, ease: EASE }}
    className={`group relative block overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-night-800 ${className}`}
  >
    <img
      src={picture}
      alt={name}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.07]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/30 to-transparent" />

    {hiddenGem && (
      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-lime-400 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-night-950">
        Hidden gem
      </span>
    )}

    <span className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <ArrowUpRight className="h-4 w-4" />
    </span>

    <div className="absolute inset-x-0 bottom-0 p-4">
      {location && (
        <p className="flex items-center gap-1 text-xs font-medium text-lime-300">
          <MapPin className="h-3 w-3" /> {location}
        </p>
      )}
      <h3 className="mt-0.5 text-lg font-extrabold leading-tight text-white">{name}</h3>
      {curatedBy && (
        <p className="mt-1 text-xs text-white/60">
          Curated by <span className="text-lime-400">{curatedBy}</span>
        </p>
      )}
    </div>
  </MotionLink>
);

export default CityCard;
