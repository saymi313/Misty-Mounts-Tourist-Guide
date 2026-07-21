import React from 'react';
import {
  Wifi, Utensils, Flame, Car, Mountain, Waves, Coffee, BedDouble, Check,
} from 'lucide-react';
import { Tile, Eyebrow } from '../bento/tiles';

// Map amenity keywords to icons; fall back to a check.
const pickIcon = (label = '') => {
  const l = label.toLowerCase();
  if (l.includes('wi-fi') || l.includes('wifi')) return Wifi;
  if (l.includes('restaurant') || l.includes('trout') || l.includes('cake') || l.includes('bread')) return Utensils;
  if (l.includes('fire') || l.includes('heat')) return Flame;
  if (l.includes('pick') || l.includes('parking') || l.includes('boat') || l.includes('jetty')) return Car;
  if (l.includes('mountain') || l.includes('view')) return Mountain;
  if (l.includes('lake') || l.includes('river')) return Waves;
  if (l.includes('coffee') || l.includes('café') || l.includes('terrace')) return Coffee;
  if (l.includes('room') || l.includes('cottage') || l.includes('family')) return BedDouble;
  return Check;
};

const DetailsComponent = ({ hotel = {} }) => {
  const amenities = hotel.amenities || [];
  if (!amenities.length) return null;

  return (
    <Tile pad="p-6 sm:p-8">
      <Eyebrow>What's included</Eyebrow>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Amenities</h2>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {amenities.map((label) => {
          const Icon = pickIcon(label);
          return (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-night-700 p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-white">{label}</span>
            </div>
          );
        })}
      </div>
    </Tile>
  );
};

export default DetailsComponent;
