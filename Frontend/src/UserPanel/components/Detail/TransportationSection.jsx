import React from 'react';
import { Car, Bus, Truck, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { Tile, Eyebrow } from '../bento/tiles';
import { formatPKR } from '../../../utils/currency';

const iconFor = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('van') || t.includes('bus')) return Bus;
  if (t.includes('jeep') || t.includes('4x4')) return Truck;
  return Car;
};

const TransportationSection = ({ transportationData = [], className = '' }) => {
  if (!transportationData.length) return null;

  return (
    <Tile pad="p-6 sm:p-7" className={`h-full ${className}`}>
      <Eyebrow><Car className="h-3.5 w-3.5" /> Getting there</Eyebrow>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        Transport & local <span className="text-lime-400">routes</span>
      </h2>

      <div className="mt-6 space-y-3">
        {transportationData.map((t) => {
          const Icon = iconFor(t.type);
          return (
            <div
              key={t._id}
              className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-night-700/60 p-5 transition-colors hover:border-lime-400/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">{t.type}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/70">
                    <MapPin className="h-3.5 w-3.5 text-lime-400" /> {t.from} <ArrowRight className="h-3 w-3 text-white/40" /> {t.to}
                  </p>
                  <p className="mt-1 text-xs text-white/50">{t.provider} · {t.schedule}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 sm:flex-col sm:items-end sm:gap-1">
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {t.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {t.seats} seats
                  </span>
                </div>
                <div className="text-lg font-extrabold text-white">
                  {formatPKR(t.price)}
                  <span className="ml-1 text-xs font-normal text-white/50">/ trip</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Tile>
  );
};

export default TransportationSection;
