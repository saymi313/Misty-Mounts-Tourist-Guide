const { test } = require('node:test');
const assert = require('node:assert/strict');
const engine = import('../../Frontend/src/utils/recommendations.js');
const spots = [{ _id: 'a', name: 'Lake', city: 'Hunza', description: 'Boating and lake views' }, { _id: 'b', name: 'Museum', city: 'Skardu', activities: ['culture'] }, { _id: 'c', name: 'Trail', city: 'Hunza', activities: ['hiking'] }, { _id: 'd', name: 'Secret lake', city: 'Hunza', isApproved: false }];
test('personalized ranking explains interest matches and excludes saved and unapproved spots', async () => {
  const { recommendSpots } = await engine;
  const result = recommendSpots(spots, { interests: ['Lakes'], savedIds: ['c'] });
  assert.equal(result.personalized, true);
  assert.equal(result.results[0].spot._id, 'a');
  assert.match(result.results[0].reasons[0], /lake/);
  assert.equal(result.results.some(item => ['c', 'd'].includes(item.spot._id)), false);
});
test('cold start is labelled general, saved cities produce explicit reasons', async () => {
  const { recommendSpots } = await engine;
  assert.equal(recommendSpots(spots).personalized, false);
  const result = recommendSpots(spots, { savedItems: [{ type: 'hotel', id: 'hotel', city: 'Skardu' }] });
  assert.equal(result.results[0].spot._id, 'b');
  assert.match(result.results[0].reasons[0], /saved items/);
});
