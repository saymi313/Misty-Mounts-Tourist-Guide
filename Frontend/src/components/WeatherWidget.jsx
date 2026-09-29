import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Cloud, Wind, Droplets, RefreshCw } from 'lucide-react';
import { fetchForecast, describeWeather, validCoordinates, formatWeatherValue, formatWeatherTime, currentIsFresh, pakistanDate } from '../utils/weather';

export default function WeatherWidget({ lat, lng, placeName, locationKind = 'spot', className = '' }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [refresh, setRefresh] = useState(0);
  const [clock, setClock] = useState(Date.now());
  const hasCoords = validCoordinates(lat, lng);
  useEffect(() => {
    if (!hasCoords) return;
    let active = true;
    const controller = new AbortController();
    setData(null); setState('loading');
    fetchForecast(lat, lng, { signal: controller.signal })
      .then(result => { if (active) { setData(result); setClock(Date.now()); setState('ok'); } })
      .catch(() => { if (active) setState('error'); });
    return () => { active = false; controller.abort(); };
  }, [lat, lng, hasCoords, refresh]);
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(Date.now());
      if (!document.hidden) setRefresh(value => value + 1);
    }, 15 * 60000);
    const visible = () => { if (!document.hidden) { setClock(Date.now()); setRefresh(value => value + 1); } };
    document.addEventListener('visibilitychange', visible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, []);
  const fresh = currentIsFresh(data, clock);
  const matchesLocation = data?.meta.requestedLatitude === lat && data?.meta.requestedLongitude === lng;
  return <section aria-label="Weather forecast" className={`rounded-3xl border border-white/10 bg-night-900/70 p-6 sm:p-7 ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-lime-300"><Cloud className="h-4 w-4" />Weather for {placeName || 'this location'}</h2>
      {hasCoords && <button type="button" disabled={state === 'loading'} onClick={() => setRefresh(value => value + 1)} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-3 text-sm focus:outline-lime-400 disabled:opacity-50"><RefreshCw className="h-4 w-4" />Refresh</button>}
    </div>
    {!hasCoords ? <p className="mt-4 text-sm text-white/70">Weather unavailable: this destination has no valid spot or city coordinates.</p> : <>
      <p className="mt-3 text-xs leading-relaxed text-white/70">{locationKind === 'city' ? 'City-centre estimate — spot coordinates are unavailable.' : 'Model estimate for the listed spot coordinates.'} Mountain conditions may differ.</p>
      <p className="mt-1 text-xs text-white/60">Requested coordinates: {lat}, {lng}</p>
      {(state === 'loading' || (state === 'ok' && !matchesLocation)) && <p role="status" className="mt-4 text-sm text-white/70">Loading provider weather data…</p>}
      {state === 'error' && <p role="alert" className="mt-4 text-sm text-amber-200">Weather could not be retrieved or validated. Refresh to try again.</p>}
      {state === 'ok' && data && matchesLocation && <>
        <div className="mt-5">
          <p className="text-xs font-semibold text-white/70">{fresh ? 'Current model estimate' : 'Current conditions unavailable or outdated'}</p>
          {fresh && <>
            <p className="mt-2 text-4xl font-extrabold text-white">{formatWeatherValue(data.current.temperature_2m, '°C')}</p>
            <p className="mt-1 text-sm text-white/75">{describeWeather(data.current.weather_code).label}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-1"><Wind className="h-4 w-4" />Wind (10 m): {formatWeatherValue(data.current.wind_speed_10m, ' km/h')}</span>
              <span className="inline-flex items-center gap-1"><Droplets className="h-4 w-4" />Humidity: {formatWeatherValue(data.current.relative_humidity_2m, '%')}</span>
            </div>
          </>}
          <p className="mt-2 text-xs text-white/65">Valid at: {formatWeatherTime(data.meta.validAt)}</p>
        </div>
        <div className="mt-5 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {data.daily.time.map((date, index) => <div key={date} className="w-36 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/75">
              <p className="font-semibold text-white">{date === pakistanDate(clock) ? 'Today' : new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'Asia/Karachi' })}</p>
              <p className="mt-1">{date}</p>
              <p className="mt-2 min-h-8">{describeWeather(data.daily.weather_code[index]).label}</p>
              <p className="mt-2">High: {formatWeatherValue(data.daily.temperature_2m_max[index], '°C')}</p>
              <p>Low: {formatWeatherValue(data.daily.temperature_2m_min[index], '°C')}</p>
              <p className="mt-1">Max precipitation chance: {formatWeatherValue(data.daily.precipitation_probability_max[index], '%')}</p>
            </div>)}
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-white/65">Fetched: {formatWeatherTime(data.meta.fetchedAt)}. Model grid: {data.meta.gridLatitude}, {data.meta.gridLongitude}. Model elevation: {formatWeatherValue(data.elevation, ' m')}.</p>
        <p className="mt-2 text-xs leading-relaxed text-white/65">Source: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-lime-300 underline">Open-Meteo</a>. Modelled data, not a local weather-station observation. <a href={data.meta.url} target="_blank" rel="noreferrer" className="text-lime-300 underline">View provider data</a></p>
      </>}
    </>}
  </section>;
}
WeatherWidget.propTypes = { lat: PropTypes.number, lng: PropTypes.number, placeName: PropTypes.string, locationKind: PropTypes.oneOf(['spot', 'city']), className: PropTypes.string };
