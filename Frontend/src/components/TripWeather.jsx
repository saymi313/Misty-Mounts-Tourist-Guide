import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CITY_COORDS } from '../data/geo';
import api, { LIVE } from '../data/api';
import { describeWeather, fetchForecast, formatWeatherTime } from '../utils/weather';
import { assessDay, suggestSwaps, reportsForCity } from '../utils/tripWeather';

const forecastCache = new Map();
const pending = new Map();
async function cityForecast(city, force = false) {
  const coords = CITY_COORDS[city];
  if (!coords) return { error: 'No forecast coordinates for this city.' };
  const existing = forecastCache.get(city);
  if (!force && existing && Date.now() - existing.fetchedAt < 15 * 60000) return existing;
  if (pending.has(city)) return pending.get(city);
  const request = (async () => {
    try {
      const data = await fetchForecast(...coords, { forecastDays: 16, signal: AbortSignal.timeout(8000) });
      const snapshot = { daily: data.daily, fetchedAt: data.meta.fetchedAt, meta: data.meta };
      if (!Array.isArray(data.daily?.time)) throw new Error('Invalid weather response');
      if (forecastCache.size >= 30) forecastCache.delete(forecastCache.keys().next().value);
      forecastCache.set(city, snapshot);
      return snapshot;
    } catch { return { error: 'Weather is temporarily unavailable. Try checking again.' }; }
    finally { pending.delete(city); }
  })();
  pending.set(city, request);
  return request;
}
export default function TripWeather({ plan, onSwap }) {
  const [snapshots, setSnapshots] = useState({});
  const [reports, setReports] = useState([]);
  const [reportState, setReportState] = useState('');
  const [busy, setBusy] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [notice, setNotice] = useState('');
  const [lastSwap, setLastSwap] = useState(null);
  const citiesKey = JSON.stringify([...new Set(plan.days.map(day => day.city))].sort());
  useEffect(() => {
    const update = () => { if (!document.hidden) setRefresh(value => value + 1); };
    const timer = setInterval(update, 15 * 60000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    let active = true;
    setBusy(true); setSnapshots({}); setReports([]); setReportState(''); setNotice(''); setLastSwap(null);
    const cities = JSON.parse(citiesKey);
    const weather = Promise.all(cities.map(async city => [city, await cityForecast(city, refresh > 0)]));
    const hazards = LIVE ? api.get('/natural-disaster/get-disaster', { timeout: 8000 }).then(({ data }) => ({ reports: Array.isArray(data.data) ? data.data : [], state: `Guide reports checked ${new Date().toLocaleString()}.` })).catch(() => ({ reports: [], state: 'Guide reports are unavailable. Check the Safety page before travelling.' })) : Promise.resolve({ reports: [], state: 'Live guide reports require a connected backend.' });
    Promise.all([weather, hazards]).then(([forecasts, alerts]) => {
      if (!active) return;
      setSnapshots(Object.fromEntries(forecasts)); setReports(alerts.reports); setReportState(alerts.state); setBusy(false);
    });
    return () => { active = false; };
  }, [citiesKey, refresh]);
  const weather = Object.fromEntries(plan.days.map(day => [day.day, snapshots[day.city]?.error ? { status: 'unavailable', reason: snapshots[day.city].error } : assessDay(snapshots[day.city]?.daily, day.date)]));
  const suggestions = busy ? [] : suggestSwaps(plan.days, weather);
  const cities = JSON.parse(citiesKey);
  const relevant = reports.filter(report => cities.some(city => reportsForCity([report], city).length));
  return <section aria-label="Weather-aware planning" className="mb-5 rounded-2xl border border-white/15 bg-night-800 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-bold">Weather and trip adjustments</h2>
      <button type="button" disabled={busy} onClick={() => setRefresh(value => value + 1)} className="min-h-11 rounded-xl border border-white/20 px-3 text-sm font-semibold focus:outline-lime-400 disabled:opacity-50">Check again</button>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-white/70">City-level forecasts from <a className="text-lime-300 underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>, up to 16 days ahead. Mountain conditions can differ. Suggestions are planning rules, not official warnings or confirmation of safe travel. Forecasts are reused for up to 15 minutes.</p>
    {busy ? <p role="status" className="mt-4 text-sm text-lime-300">Checking forecasts and guide reports…</p> : <>
      <details className="mt-4">
        <summary className="min-h-11 cursor-pointer text-sm font-semibold text-white/80">Daily forecasts ({plan.days.length} days)</summary>
        <div className="space-y-3">
        {plan.days.map(day => {
          const item = weather[day.day], snapshot = snapshots[day.city];
          return <div key={day.day} className="rounded-xl border border-white/10 p-3">
            <p className="text-sm font-semibold">Day {day.day} · {day.city} · {day.date || 'No date selected'}</p>
            {item.status === 'available' && <p className="mt-1 text-sm text-white/80">{describeWeather(item.code).label} · {item.min}–{item.max}°C · Max precipitation chance {item.rain}% · Max wind (10 m) {item.wind} km/h</p>}
            <p className={`mt-1 text-xs leading-relaxed ${item.level > 0 ? 'text-amber-200' : 'text-white/65'}`}>{item.reason}</p>
            {snapshot?.meta && <p className="mt-1 text-xs text-white/60">Forecast fetched {formatWeatherTime(snapshot.fetchedAt)} · Requested city coordinates: {snapshot.meta.requestedLatitude}, {snapshot.meta.requestedLongitude} · Model grid: {snapshot.meta.gridLatitude}, {snapshot.meta.gridLongitude}. <a href={snapshot.meta.url} target="_blank" rel="noreferrer" className="text-lime-300 underline">View provider data</a></p>}
          </div>;
        })}
        </div>
      </details>
      {suggestions.map(suggestion => <div key={suggestion.from} className="mt-4 rounded-xl border border-lime-400/25 p-3">
        <p className="text-sm text-white/80">{suggestion.reason}</p>
        <button type="button" onClick={() => { onSwap(suggestion.from, suggestion.to); setLastSwap(suggestion); setNotice(`Activities swapped between days ${suggestion.from} and ${suggestion.to}. Dates and lodging are unchanged.`); }} className="mt-2 min-h-11 rounded-xl bg-lime-400 px-4 text-sm font-bold text-night-950 focus:outline-white">Swap day {suggestion.from} and {suggestion.to}</button>
      </div>)}
      {notice && <p role="status" className="mt-3 text-sm text-lime-300">{notice}</p>}
      {lastSwap && <button type="button" className="mt-2 min-h-11 text-sm text-lime-300 underline" onClick={() => { onSwap(lastSwap.from, lastSwap.to); setLastSwap(null); setNotice('Last activity swap undone.'); }}>Undo last swap</button>}
      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-sm font-semibold">Guide reports</p>
        <p className="mt-1 text-xs text-white/65">{reportState} Reports are not independently verified; absence of a matching report does not establish road access.</p>
        {relevant.map(report => <p key={report._id} className="mt-2 text-sm text-amber-200">{report.name} · {report.location} · Report date: {Number.isFinite(Date.parse(report.date)) ? new Date(report.date).toLocaleDateString() : 'Unknown'} · {report.severity}</p>)}
        <Link to="/safety" className="mt-2 inline-flex min-h-11 items-center text-sm text-lime-300 underline">View reports and safety information</Link>
      </div>
    </>}
  </section>;
}
TripWeather.propTypes = { plan: PropTypes.shape({ days: PropTypes.arrayOf(PropTypes.object).isRequired }).isRequired, onSwap: PropTypes.func.isRequired };
