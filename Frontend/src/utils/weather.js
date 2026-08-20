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
  return WMO[code] || { label: "—", icon: "cloud" };
}

/** Fetch current conditions + a 7-day daily forecast for a coordinate. */
export async function fetchForecast(lat, lng, { signal } = {}) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
    `&timezone=auto&forecast_days=7`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  return res.json();
}

/**
 * A rough "best time to visit" window from elevation — good enough for the
 * north, where high passes and lakes are snowed-in outside summer.
 */
export function bestTimeToVisit(elevation) {
  if (elevation == null) return null;
  if (elevation >= 3500) return "Late June – September (high passes clear of snow)";
  if (elevation >= 2500) return "May – October";
  if (elevation >= 1500) return "April – November";
  return "Year-round";
}
