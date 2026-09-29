const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const TouristSpot = require('../AdminBackend/models/TouristSport');
const TourPackage = require('../UserBackend/models/tourPackage');
const Accommodation = require('../AdminBackend/models/Accommodation');

test('AI HTTP flow validates requests, filters approved data, reuses catalogue and limits usage', { timeout: 15000 }, async () => {
  const oldKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  let reads = 0;
  const originals = [TouristSpot, TourPackage, Accommodation].map(model => model.find);
  TouristSpot.find = filter => {
    assert.equal(filter.isApproved, true); reads++;
    return { select: () => ({ lean: async () => [{ city: 'Hunza', nearbyPlaces: [
      { _id: 'lake', name: 'Lake', isApproved: true }, { _id: 'secret', name: 'Unapproved', isApproved: false },
    ] }] }) };
  };
  TourPackage.find = filter => { assert.equal(filter.isPublished, true); return { select: () => ({ lean: async () => [] }) }; };
  Accommodation.find = filter => { assert.equal(filter.isAvailable, true); return { select: () => ({ lean: async () => [] }) }; };
  const app = express(); app.use(express.json()); app.use('/ai', require('../routes/aiRoutes'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const post = (path, body) => fetch(`http://127.0.0.1:${server.address().port}/ai/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    assert.equal((await post('plan', {})).status, 400);
    const plan = await (await post('plan', { days: 2, people: 2, budget: 50000, startDate: '2026-10-01' })).json();
    assert.equal(plan.fallback, true);
    assert.deepEqual(plan.days.flatMap(d => d.spots.map(s => s._id)), ['lake']);
    const chat = await (await post('chat', { messages: 'Hunza' })).json();
    assert.equal(chat.sources[0].href, '/city/Hunza/spot/lake');
    assert.equal(reads, 1);
    const search = await (await post('search', { query: 'lake Hunza' })).json();
    assert.equal(search.results[0].id, 'lake');
    assert.equal(search.fallback, true);
    assert.equal((await post('search', { query: 42 })).status, 400);
    assert.equal((await post('chat', { messages: [null] })).status, 400);
    let response;
    for (let i = 0; i < 28; i++) response = await post('chat', { messages: 'Hunza' });
    assert.equal(response.status, 429);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    [TouristSpot, TourPackage, Accommodation].forEach((model, i) => { model.find = originals[i]; });
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = oldKey;
  }
});
