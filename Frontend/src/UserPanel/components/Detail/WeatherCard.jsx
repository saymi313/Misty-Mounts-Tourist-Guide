import React from 'react';
import { Sun, Cloud, CloudSun, CloudRain, Droplets, Wind } from 'lucide-react';
import { Tile } from '../bento/tiles';

const iconMap = { sun: Sun, cloud: Cloud, 'cloud-sun': CloudSun, 'cloud-rain': CloudRain };

const WeatherCard = ({ weather, className = '' }) => {
  if (!weather) return null;
  const desc = weather.weather?.[0]?.description || 'Clear';
  const CurrentIcon = iconMap[weather.weather?.[0]?.icon] || CloudSun;

  return (
    <Tile glow="sky" pad="p-0" className={`overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-400">Current weather</p>
          <div className="mt-1.5 flex items-end gap-1">
            <span className="text-5xl font-extrabold tracking-tight text-white">
              {Math.round(weather.main.temp)}°
            </span>
            <span className="pb-1.5 text-sm text-white/50">C</span>
          </div>
          <p className="mt-1 text-sm capitalize text-white/60">{desc}</p>
        </div>
        <CurrentIcon className="h-14 w-14 text-lime-400" strokeWidth={1.5} />
      </div>

      <div className="flex items-center gap-4 border-t border-white/[0.07] px-5 py-3.5 text-sm text-white/60">
        <span className="inline-flex items-center gap-1.5">
          <Droplets className="h-4 w-4 text-sky-400" /> {weather.main.humidity}%
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wind className="h-4 w-4 text-sky-400" /> {weather.wind.speed} m/s
        </span>
      </div>

      {weather.forecast && (
        <div className="grid grid-cols-5 gap-1 border-t border-white/[0.07] p-3">
          {weather.forecast.map((f) => {
            const Icon = iconMap[f.icon] || CloudSun;
            return (
              <div key={f.day} className="flex flex-col items-center gap-1.5 rounded-xl py-2">
                <span className="text-xs text-white/40">{f.day}</span>
                <Icon className="h-4 w-4 text-lime-400" />
                <span className="text-xs font-semibold text-white">{f.high}°</span>
                <span className="text-[10px] text-white/40">{f.low}°</span>
              </div>
            );
          })}
        </div>
      )}
    </Tile>
  );
};

export default WeatherCard;
