import React from 'react';
import { Car, Bus, Truck, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

const iconFor = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('van') || t.includes('bus')) return Bus;
  if (t.includes('jeep') || t.includes('4x4')) return Truck;
  return Car;
};

const TransportationSection = ({ transportationData = [] }) => {
  if (!transportationData.length) return null;

  return (
    <section className="mt-12">
      <p className="eyebrow">
        <Car className="h-3.5 w-3.5" /> Getting there
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50 sm:text-3xl">
        Transport & local routes
      </h2>

      <div className="mt-6 space-y-3">
        {transportationData.map((t) => {
          const Icon = iconFor(t.type);
          return (
            <div
              key={t._id}
              className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-abyss-900 p-5 shadow-card ring-1 ring-abyss-900/10 dark:ring-frost-50/10 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-glacier-500/15 text-glacier-700 dark:bg-glacier-400/15 dark:text-glacier-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-abyss-900 dark:text-frost-50">{t.type}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-frost-600 dark:text-frost-300">
                    <MapPin className="h-3.5 w-3.5" /> {t.from} <ArrowRight className="h-3 w-3" /> {t.to}
                  </p>
                  <p className="mt-1 text-xs text-frost-500 dark:text-frost-400">{t.provider} · {t.schedule}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 sm:flex-col sm:items-end sm:gap-1">
                <div className="flex items-center gap-3 text-xs text-frost-500 dark:text-frost-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {t.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {t.seats} seats
                  </span>
                </div>
                <div className="font-display text-lg font-semibold text-abyss-900 dark:text-frost-50">
                  ${t.price}
                  <span className="ml-1 text-xs font-sans font-normal text-frost-500 dark:text-frost-400">/ trip</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TransportationSection;
