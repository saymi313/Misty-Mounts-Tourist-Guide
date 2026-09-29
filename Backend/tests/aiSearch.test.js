const { test } = require('node:test');
const assert = require('node:assert/strict');
const { searchSpots } = require('../utils/aiSearch');
const spots = [
  { _id: 'a', name: 'Quiet lake', city: 'Skardu', description: 'Peaceful water and mountain scenery' },
  { _id: 'b', name: 'Lake', city: 'Hunza', description: 'Boating on blue water' },
  { _id: 'c', name: 'Fort', city: 'Skardu', description: 'Historic village and museum' },
];
test('city mentioned in query restricts destination results', () => {
  assert.deepEqual(searchSpots(spots, 'quiet lakes near Skardu').results.map(r => r.id), ['a']);
  assert.equal(searchSpots(spots, 'Skardu').results.length, 2);
});
test('explicit region overrides inferred region', () => {
  assert.deepEqual(searchSpots(spots, 'lake Skardu', 'Hunza').results.map(r => r.id), ['b']);
});
test('AI synonyms match only actual catalogue descriptions', () => {
  const result = searchSpots(spots, 'sukoon', '', { terms: ['peaceful', 'invented-place'] });
  assert.deepEqual(result.results.map(r => r.id), ['a']);
  assert.deepEqual(result.results[0].matched, ['peaceful']);
  assert.equal(result.fallback, false);
});
test('invalid model output uses keyword search, no matches remain empty', () => {
  assert.equal(searchSpots(spots, 'museum', '', { terms: [null, 4, {}] }).fallback, true);
  assert.deepEqual(searchSpots(spots, 'spaceship').results, []);
});
test('negated preferences do not create positive matches', () => {
  assert.deepEqual(searchSpots(spots, 'no museum', '', { terms: ['museum'] }).results, []);
});
