const { test } = require('node:test');
const assert = require('node:assert/strict');
const helpers = import('../../Frontend/src/utils/tripWeather.js');
const daily = { time: ['2026-10-01', '2026-10-02'], weather_code: [95, 1], precipitation_probability_max: [90, 10], wind_speed_10m_max: [55, 5], temperature_2m_min: [3, 8], temperature_2m_max: [12, 20] };

test('weather distinguishes disruptive forecasts from missing or incomplete data', async () => {
  const { assessDay } = await helpers;
  assert.equal(assessDay(daily, '2026-10-01').level, 2);
  assert.equal(assessDay(daily, '2026-10-02').level, 0);
  assert.equal(assessDay(daily, '2027-01-01').status, 'unavailable');
  assert.equal(assessDay({ ...daily, wind_speed_10m_max: [null] }, '2026-10-01').status, 'unavailable');
  assert.equal(assessDay(undefined, '2026-10-01').status, 'unavailable');
  assert.equal(assessDay({ ...daily, weather_code: [999] }, '2026-10-01').status, 'unavailable');
  assert.equal(assessDay({ ...daily, precipitation_probability_max: [110] }, '2026-10-01').status, 'unavailable');
});
test('swaps require a same-city lower-concern day and preserve dates, costs and destinations', async () => {
  const { suggestSwaps, swapActivities } = await helpers;
  const days = [{ day: 1, date: '2026-10-01', city: 'Hunza', spots: [{ _id: 'a', name: 'Lake trek' }] }, { day: 2, date: '2026-10-02', city: 'Hunza', spots: [{ _id: 'b', name: 'Museum' }] }];
  const weather = { 1: { status: 'available', level: 2 }, 2: { status: 'available', level: 0 } };
  assert.equal(suggestSwaps(days, weather).length, 1);
  assert.equal(suggestSwaps(days, { ...weather, 2: { status: 'unavailable' } }).length, 0);
  assert.equal(suggestSwaps([days[0], { ...days[1], city: 'Skardu' }], weather).length, 0);
  const plan = { days, budget: { total: 10000 } };
  const swapped = swapActivities(plan, 1, 2);
  assert.equal(swapped.days[0].spots[0]._id, 'b');
  assert.equal(swapped.days[0].date, days[0].date);
  assert.equal(swapped.budget, plan.budget);
  assert.equal(plan.days[0].spots[0]._id, 'a');
  assert.deepEqual(swapActivities(swapped, 1, 2), plan);
});
test('guide report matching excludes resolved and unrelated reports', async () => {
  const { reportsForCity } = await helpers;
  const reports = [{ location: 'Upper Hunza', isResolved: false }, { location: 'Hunza', isResolved: true }, { location: 'Skardu' }, { location: '', affectedAreas: ['Hunza'] }];
  assert.equal(reportsForCity(reports, 'Hunza').length, 2);
  assert.equal(reportsForCity(reports, '').length, 0);
});
