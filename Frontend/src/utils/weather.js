/**
 * Weather helpers backed by Open-Meteo — a completely free API (no key, no
 * signup, CORS-enabled) so the browser can call it directly. WMO weather codes
 * are mapped to a human label + an icon key the WeatherWidget resolves to a
 * lucide icon.
 */

// WMO code → { label, icon }
const WMO = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mainly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Rime fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Heavy drizzle", icon: "drizzle" },
  56: { label: "Freezing drizzle", icon: "drizzle" },
  57: { label: "Freezing drizzle", icon: "drizzle" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  66: { label: "Freezing rain", icon: "rain" },
  67: { label: "Freezing rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Rain showers", icon: "rain" },
  81: { label: "Rain showers", icon: "rain" },
  82: { label: "Heavy showers", icon: "rain" },
  85: { label: "Snow showers", icon: "snow" },
  86: { label: "Snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Thunderstorm", icon: "storm" },
  99: { label: "Thunderstorm, hail", icon: "storm" },
};

export function describeWeather(code) {
  return WMO[code] || { label: "Condition unavailable", icon: "cloud" };
}

export const WEATHER_TIMEZONE = 'Asia/Karachi';
export const validCoordinates = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
export const formatWeatherValue = (value, unit = '') => Number.isFinite(value) ? `${value}${unit}` : 'Unavailable';
export const pakistanDate = (now = Date.now()) => new Date(now + 18000000).toISOString().slice(0, 10);
export const formatWeatherTime = value => Number.isFinite(value) ? new Intl.DateTimeFormat('en-GB', { timeZone: WEATHER_TIMEZONE, dateStyle: 'medium', timeStyle: 'short' }).format(value) + ' PKT' : 'Unavailable';
export const currentIsFresh = (data, now = Date.now()) => Number.isFinite(data?.meta?.validAt) && now - data.meta.validAt <= 90 * 60000 && data.meta.validAt - now <= 15 * 60000;

const CURRENT_UNITS = { temperature_2m: '°C', weather_code: 'wmo code', wind_speed_10m: 'km/h', relative_humidity_2m: '%' };
const DAILY_UNITS = { temperature_2m_max: '°C', temperature_2m_min: '°C', weather_code: 'wmo code', precipitation_probability_max: '%', wind_speed_10m_max: 'km/h' };
const validValue = (key, value) => {
  if (!Number.isFinite(value)) return null;
  if (key === 'weather_code') return WMO[value] ? value : null;
  if (key.includes('temperature')) return value >= -100 && value <= 70 ? value : null;
  if (key.includes('wind')) return value >= 0 && value <= 500 ? value : null;
  return value >= 0 && value <= 100 ? value : null;
};
export function normalizeForecast(raw, { lat, lng, url, now = Date.now() }) {
  if (!raw || raw.error || raw.timezone !== WEATHER_TIMEZONE || raw.utc_offset_seconds !== 18000 || !validCoordinates(raw.latitude, raw.longitude)) throw new Error('Invalid weather location or timezone');
  const dates = raw.daily?.time;
  if (!Array.isArray(dates) || !dates.length || dates.some((date, i) => typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || (i && date <= dates[i - 1]))) throw new Error('Invalid forecast dates');
  const current = { time: raw.current?.time || null };
  if (raw.daily_units?.time !== 'iso8601' || (current.time && raw.current_units?.time !== 'iso8601')) throw new Error('Unexpected weather time units');
  for (const [key, unit] of Object.entries(CURRENT_UNITS)) {
    if (raw.current?.[key] != null && raw.current_units?.[key] !== unit) throw new Error('Unexpected current weather units');
    current[key] = validValue(key, raw.current?.[key]);
  }
  const daily = { time: dates };
  for (const [key, unit] of Object.entries(DAILY_UNITS)) {
    const values = raw.daily?.[key];
    if (Array.isArray(values) && values.some(value => value != null) && raw.daily_units?.[key] !== unit) throw new Error('Unexpected forecast units');
    daily[key] = dates.map((_, i) => validValue(key, Array.isArray(values) && values.length === dates.length ? values[i] : null));
  }
  dates.forEach((_, i) => {
    if (daily.temperature_2m_min[i] !== null && daily.temperature_2m_max[i] !== null && daily.temperature_2m_min[i] > daily.temperature_2m_max[i]) {
      daily.temperature_2m_min[i] = null; daily.temperature_2m_max[i] = null;
    }
  });
  const validAt = typeof current.time === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(current.time) ? Date.parse(`${current.time}Z`) - raw.utc_offset_seconds * 1000 : NaN;
  return { current, daily, timezone: raw.timezone, elevation: Number.isFinite(raw.elevation) ? raw.elevation : null,
    meta: { source: 'Open-Meteo', url, fetchedAt: now, validAt: Number.isFinite(validAt) ? validAt : null, requestedLatitude: lat, requestedLongitude: lng, gridLatitude: raw.latitude, gridLongitude: raw.longitude } };
}

/** Explicit units; null values remain unavailable. No synthetic weather fallback. */
export async function fetchForecast(lat, lng, { signal, forecastDays = 7 } = {}) {
  if (!validCoordinates(lat, lng)) throw new Error('Valid weather coordinates are required');
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=Asia%2FKarachi&forecast_days=${forecastDays === 16 ? 16 : 7}` +
    '&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm&timeformat=iso8601&cell_selection=land';
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 10000);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`Weather provider returned ${res.status}`);
    return normalizeForecast(await res.json(), { lat, lng, url });
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
