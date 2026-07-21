import React from 'react';
import {
  Wifi, Utensils, Flame, Car, Mountain, Waves, Coffee, BedDouble, Check,
} from 'lucide-react';

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
    <section className="mt-10">
      <p className="eyebrow">What's included</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50">Amenities</h2>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {amenities.map((label) => {
          const Icon = pickIcon(label);
          return (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-abyss-900/10 dark:bg-abyss-900 dark:ring-frost-50/10"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-glacier-500/15 text-glacier-700 dark:bg-glacier-400/15 dark:text-glacier-300">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-abyss-900 dark:text-frost-50">{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DetailsComponent;
