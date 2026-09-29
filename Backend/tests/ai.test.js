const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateOptions, buildPlan, rank } = require('../utils/aiPlanner');
const { Cache, generate } = require('../utils/aiRuntime');
const options = { days: 3, people: 3, budget: 100000, startDate: '2026-10-01', pace: 'relaxed', transport: 'own-car', interests: ['lake'] };
const catalog = { spots: [
  { _id: 'a', name: 'Lake', city: 'Hunza' }, { _id: 'b', name: 'Fort', city: 'Hunza' }, { _id: 'c', name: 'Park', city: 'Hunza' },
  { _id: 'd', name: 'Lake', city: 'Skardu' },
], hotels: [{ _id: 'h', city: 'Hunza', price: 5000, blackoutDates: [] }] };
test('reject invalid budgets, group sizes, dates and trip lengths', () => {
  for (const patch of [{ budget: -1 }, { people: 1.5 }, { days: 15 }, { startDate: '2026-02-30' }]) assert.throws(() => validateOptions({ ...options, ...patch }));
  assert.equal(validateOptions(options).days, 3);
});
test('budget arithmetic counts rooms, nights, group meals and contingency', () => {
  const result = buildPlan(catalog, options);
  assert.equal(result.budget.lodging, 20000);
  assert.equal(result.budget.food, 16200);
  assert.equal(result.budget.transport, 10500);
  assert.equal(result.budget.total, 53705);
  assert.equal(result.days[2].date, '2026-10-03');
  assert.deepEqual(result.cities, ['Hunza']);
});
test('blackout on any night excludes stay and marks incomplete costs', () => {
  const result = buildPlan({ ...catalog, hotels: [{ ...catalog.hotels[0], blackoutDates: ['2026-10-02'] }] }, options);
  assert.equal(result.stay, null);
  assert.equal(result.budget.incomplete, true);
});
test('reject hallucinated IDs, duplicates, other-city IDs and malformed model output', () => {
  for (const days of [[null, {}, {}], [{ spotIds: ['fake'] }, { spotIds: [] }, { spotIds: [] }], [{ spotIds: ['a'] }, { spotIds: ['a'] }, { spotIds: [] }], [{ spotIds: ['d'] }, { spotIds: [] }, { spotIds: [] }]]) {
    assert.equal(buildPlan(catalog, options, { days }).fallback, true);
  }
  const result = buildPlan(catalog, options, { days: [{ spotIds: ['c'] }, { spotIds: [] }, { spotIds: ['a'] }] });
  assert.equal(result.fallback, false);
  assert.equal(result.days[0].spots[0]._id, 'c');
});
test('retrieval ranks requested city before unrelated records', () => {
  assert.equal(rank(catalog.spots, 'Skardu', 1)[0]._id, 'd');
  assert.deepEqual(buildPlan(catalog, { ...options, region: 'Unknown' }).days, []);
});
test('cache evicts bounded entries and expires stale values', () => {
  const cache = new Cache(1, 1000);
  cache.set('a', 1); cache.set('b', 2);
  assert.equal(cache.get('a'), undefined);
  cache.entries.get('b').expires = Date.now() - 1;
  assert.equal(cache.get('b'), undefined);
});
test('provider errors fall back without exposing secrets', async () => {
  const oldFetch = global.fetch, oldKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key';
  global.fetch = async () => { throw new Error('network failure'); };
  try { assert.equal(await generate('system', []), null); }
  finally { global.fetch = oldFetch; if (oldKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = oldKey; }
});
