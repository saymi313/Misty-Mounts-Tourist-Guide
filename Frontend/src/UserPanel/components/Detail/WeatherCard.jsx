import React from 'react';
import { Sun, Cloud, CloudSun, CloudRain, Droplets, Wind } from 'lucide-react';

const iconMap = { sun: Sun, cloud: Cloud, 'cloud-sun': CloudSun, 'cloud-rain': CloudRain };

const WeatherCard = ({ weather }) => {
  if (!weather) return null;
  const desc = weather.weather?.[0]?.description || 'Clear';
  const CurrentIcon = iconMap[weather.weather?.[0]?.icon] || CloudSun;

  return (
    <div className="overflow-hidden rounded-3xl bg-abyss-900 text-frost-100 shadow-card">
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-frost-400">Current weather</p>
          <div className="mt-1 flex items-end gap-1">
            <span className="font-display text-4xl font-semibold text-frost-50">
              {Math.round(weather.main.temp)}°
            </span>
            <span className="pb-1 text-sm text-frost-300">C</span>
          </div>
          <p className="mt-1 text-sm text-frost-300">{desc}</p>
        </div>
        <CurrentIcon className="h-12 w-12 text-glacier-300" strokeWidth={1.5} />
      </div>

      <div className="flex items-center gap-4 border-t border-abyss-700 px-5 py-3 text-sm text-frost-300">
        <span className="inline-flex items-center gap-1.5">
          <Droplets className="h-4 w-4 text-glacier-300" /> {weather.main.humidity}%
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wind className="h-4 w-4 text-glacier-300" /> {weather.wind.speed} m/s
        </span>
      </div>

      {weather.forecast && (
        <div className="grid grid-cols-5 gap-1 border-t border-abyss-700 p-3">
          {weather.forecast.map((f) => {
            const Icon = iconMap[f.icon] || CloudSun;
            return (
              <div key={f.day} className="flex flex-col items-center gap-1.5 rounded-xl py-2">
                <span className="text-xs text-frost-400">{f.day}</span>
                <Icon className="h-4 w-4 text-glacier-300" />
                <span className="text-xs font-medium text-frost-100">{f.high}°</span>
                <span className="text-[10px] text-frost-500">{f.low}°</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
