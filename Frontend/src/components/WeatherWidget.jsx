import React, { useEffect, useState } from "react";
import {
  Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudRain,
  CloudSnow, CloudLightning, Wind, Droplets, CalendarClock, MapPin,
} from "lucide-react";
import { fetchForecast, describeWeather, bestTimeToVisit } from "../utils/weather";

const ICONS = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

const WIcon = ({ icon, className }) => {
  const Cmp = ICONS[icon] || Cloud;
  return <Cmp className={className} />;
};

const dayLabel = (iso, i) =>
  i === 0 ? "Today" : new Date(iso + "T00:00").toLocaleDateString(undefined, { weekday: "short" });

/**
 * Free 7-day weather + conditions for a coordinate (Open-Meteo). Renders
 * nothing if no valid coordinates are supplied.
 */
const WeatherWidget = ({ lat, lng, placeName, className = "" }) => {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | error

  const hasCoords = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

  useEffect(() => {
    if (!hasCoords) return;
    const ctrl = new AbortController();
    setState("loading");
    fetchForecast(Number(lat), Number(lng), { signal: ctrl.signal })
      .then((d) => { setData(d); setState("ok"); })
      .catch((e) => { if (e.name !== "AbortError") setState("error"); });
    return () => ctrl.abort();
  }, [lat, lng, hasCoords]);

  if (!hasCoords) return null;

  return (
    <section className={`rounded-3xl border border-white/10 bg-night-900/70 p-6 sm:p-7 ${className}`}>
      <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-lime-400">
        <Cloud className="h-3.5 w-3.5" /> Weather &amp; conditions
      </div>

      {state === "loading" && (
        <div className="flex items-center gap-3 text-white/50">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      )}

      {state === "error" && (
        <p className="text-sm text-white/50">Weather is unavailable right now — please check back shortly.</p>
      )}

      {state === "ok" && data && (
        <>
          {/* Current */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <WIcon icon={describeWeather(data.current?.weather_code).icon} className="h-12 w-12 text-lime-400" />
              <div>
                <div className="text-4xl font-extrabold tracking-tight text-white">
                  {Math.round(data.current?.temperature_2m)}°C
                </div>
                <div className="text-sm text-white/60">
                  {describeWeather(data.current?.weather_code).label}
                  {placeName ? <span className="text-white/35"> · {placeName}</span> : null}
                </div>
              </div>
            </div>
            <div className="flex gap-5 text-sm text-white/55">
              <span className="flex items-center gap-1.5"><Wind className="h-4 w-4 text-white/40" />{Math.round(data.current?.wind_speed_10m)} km/h</span>
              <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4 text-white/40" />{Math.round(data.current?.relative_humidity_2m)}%</span>
              {Number.isFinite(data.elevation) && (
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-white/40" />{Math.round(data.elevation)} m</span>
              )}
            </div>
          </div>

          {/* 7-day */}
          <div className="mt-6 overflow-x-auto">
            <div className="flex min-w-max gap-2">
              {data.daily?.time?.map((iso, i) => {
                const d = describeWeather(data.daily.weather_code[i]);
                return (
                  <div key={iso} className="flex min-w-[76px] flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{dayLabel(iso, i)}</span>
                    <WIcon icon={d.icon} className="h-6 w-6 text-lime-300" />
                    <span className="text-sm font-bold text-white">{Math.round(data.daily.temperature_2m_max[i])}°</span>
                    <span className="text-xs text-white/40">{Math.round(data.daily.temperature_2m_min[i])}°</span>
                    {Number.isFinite(data.daily.precipitation_probability_max?.[i]) && (
                      <span className="flex items-center gap-0.5 text-[10px] text-sky-300/80">
                        <Droplets className="h-3 w-3" />{data.daily.precipitation_probability_max[i]}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best time to visit */}
          {bestTimeToVisit(data.elevation) && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl bg-lime-400/10 px-4 py-3 text-sm text-lime-200/90">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" />
              <span><span className="font-semibold text-lime-300">Best time to visit:</span> {bestTimeToVisit(data.elevation)}</span>
            </div>
          )}

          <p className="mt-3 text-[11px] text-white/30">Live forecast · Open-Meteo</p>
        </>
      )}
    </section>
  );
};

export default WeatherWidget;
