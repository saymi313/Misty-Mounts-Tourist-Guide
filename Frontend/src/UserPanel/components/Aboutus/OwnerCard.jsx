import React, { useState } from 'react';
import { FaLinkedin } from 'react-icons/fa';
import { MapPin } from 'lucide-react';
import { Tile } from '../bento/tiles';

/**
 * Premium founder card — a full-bleed portrait with a name/role overlay, then a
 * body with location, bio and a single LinkedIn action. Falls back to a clean
 * initials block if the photo is missing.
 */
const OwnerCard = ({ name, role, bio, image, linkedin, location, delay = 0 }) => {
  const [broken, setBroken] = useState(false);
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Tile glow="lime" delay={delay} pad="p-0" className="group overflow-hidden">
      {/* Portrait */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {image && !broken ? (
          <img loading="lazy" decoding="async"
            src={image}
            alt={name}
            onError={() => setBroken(true)}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lime-400 to-emerald-500 text-6xl font-black text-night-950">
            {initials}
          </span>
        )}

        {/* Scrim + name overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/25 to-transparent" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime-400/20 blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm">{name}</h3>
          <p className="mt-0.5 text-sm font-semibold text-lime-400">{role}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {location && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-white/45">
            <MapPin className="h-3.5 w-3.5 text-lime-400/80" /> {location}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-white/60">{bio}</p>
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} on LinkedIn`}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-night-700/60 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-lime-400/40 hover:bg-lime-400 hover:text-night-950"
          >
            <FaLinkedin className="h-4 w-4" /> Connect
          </a>
        )}
      </div>
    </Tile>
  );
};

export default OwnerCard;
