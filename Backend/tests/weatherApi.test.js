const { test } = require('node:test');
const assert = require('node:assert/strict');
const weather = import('../../Frontend/src/utils/weather.js');
const geo = import('../../Frontend/src/data/geo.js');
const now = Date.parse('2026-10-01T07:15:00Z');
const options = { lat: 36.3167, lng: 74.65, url: 'https://api.open-meteo.com/v1/forecast', now };
function fixture() {
  return { latitude: 36.3, longitude: 74.6, elevation: 2211, timezone: 'Asia/Karachi', utc_offset_seconds: 18000,
    current: { time: '2026-10-01T12:15', temperature_2m: 12.7, wind_speed_10m: 4.3, relative_humidity_2m: 58, weather_code: 2 },
    current_units: { time: 'iso8601', temperature_2m: '°C', wind_speed_10m: 'km/h', relative_humidity_2m: '%', weather_code: 'wmo code' },
    daily: { time: ['2026-10-01'], temperature_2m_max: [19.2], temperature_2m_min: [-1.3], weather_code: [61], precipitation_probability_max: [67], wind_speed_10m_max: [24.1] },
    daily_units: { time: 'iso8601', temperature_2m_max: '°C', temperature_2m_min: '°C', weather_code: 'wmo code', precipitation_probability_max: '%', wind_speed_10m_max: 'km/h' } };
}
test('provider numbers and timestamps survive normalization without fabricated or rounded values', async () => {
  const { normalizeForecast, formatWeatherValue, currentIsFresh, pakistanDate } = await weather;
  const raw = fixture(), actual = normalizeForecast(raw, options);
  assert.equal(actual.current.temperature_2m, 12.7);
  assert.deepEqual(actual.daily, raw.daily);
  assert.equal(actual.meta.validAt, now);
  assert.equal(actual.meta.requestedLatitude, options.lat);
  assert.equal(actual.meta.gridLatitude, raw.latitude);
  assert.equal(formatWeatherValue(0, '°C'), '0°C');
  assert.equal(formatWeatherValue(null, '°C'), 'Unavailable');
  assert.equal(formatWeatherValue(undefined), 'Unavailable');
  assert.equal(currentIsFresh(actual, now), true);
  assert.equal(currentIsFresh(actual, now + 91 * 60000), false);
  assert.equal(pakistanDate(Date.parse('2026-10-01T20:30:00Z')), '2026-10-02');
});
test('missing weather data never becomes zero or a clear-sky condition', async () => {
  const { normalizeForecast, describeWeather } = await weather;
  const raw = fixture(); raw.current.temperature_2m = null; raw.current.weather_code = null; raw.daily.temperature_2m_max = [];
  const actual = normalizeForecast(raw, options);
  assert.equal(actual.current.temperature_2m, null);
  assert.equal(actual.daily.temperature_2m_max[0], null);
  assert.equal(describeWeather(actual.current.weather_code).label, 'Condition unavailable');
});
test('reject wrong units/timezones and invalidate impossible values', async () => {
  const { normalizeForecast } = await weather;
  const wrongUnits = fixture(); wrongUnits.current_units.temperature_2m = '°F';
  assert.throws(() => normalizeForecast(wrongUnits, options));
  assert.throws(() => normalizeForecast({ ...fixture(), timezone: 'UTC' }, options));
  const bad = fixture(); bad.current.relative_humidity_2m = 110; bad.daily.temperature_2m_min = [30]; bad.daily.time = ['2026-02-30'];
  assert.throws(() => normalizeForecast(bad, options));
  bad.daily.time = ['2026-10-01'];
  const result = normalizeForecast(bad, options);
  assert.equal(result.current.relative_humidity_2m, null);
  assert.equal(result.daily.temperature_2m_min[0], null);
});
test('coordinates do not coerce nulls to zero, and city fallback is explicit', async () => {
  const { validCoordinates } = await weather;
  const { weatherLocationFor } = await geo;
  assert.equal(validCoordinates(null, null), false);
  assert.equal(validCoordinates('', ''), false);
  assert.equal(validCoordinates(91, 74), false);
  assert.equal(weatherLocationFor({ latitude: 0, longitude: 0 }, 'Hunza').kind, 'city');
  assert.equal(weatherLocationFor({ latitude: 36.3, longitude: 74.6, name: 'Lake' }, 'Hunza').kind, 'spot');
  assert.equal(weatherLocationFor({ latitude: 36.3 }, 'Hunza').label, 'Hunza');
  assert.equal(weatherLocationFor({}, 'Unknown'), null);
});
test('weather request pins units and bypasses browser cache; provider failure has no mock fallback', async () => {
  const { fetchForecast } = await weather;
  const original = global.fetch;
  try {
    global.fetch = async (url, config) => {
      const query = new URL(url).searchParams;
      assert.equal(query.get('temperature_unit'), 'celsius');
      assert.equal(query.get('wind_speed_unit'), 'kmh');
      assert.equal(query.get('timezone'), 'Asia/Karachi');
      assert.equal(query.get('forecast_days'), '16');
      assert.equal(config.cache, 'no-store');
      return { ok: true, json: async () => fixture() };
    };
    assert.equal((await fetchForecast(36.3, 74.6, { forecastDays: 16 })).current.temperature_2m, 12.7);
    global.fetch = async () => ({ ok: false, status: 429 });
    await assert.rejects(fetchForecast(36.3, 74.6));
    await assert.rejects(fetchForecast(null, null));
  } finally { global.fetch = original; }
});
