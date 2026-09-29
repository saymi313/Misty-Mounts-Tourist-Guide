const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { catalogCache } = require('../middleware/catalogCache');
const { pagination } = require('../utils/pagination');

test('cache isolates private reads, invalidates writes, and bypasses unavailable Redis', async () => {
  const values = new Map(); let reads = 0, fail = false;
  const command = async ([op, key, value]) => {
    if (fail) throw new Error('offline');
    if (op === 'GET') return values.get(key);
    values.set(key, value); return 'OK';
  };
  const app = express(); app.use(catalogCache({ command, configured: true, prefix: 'test:' }));
  app.get(['/tours', '/tours/my-bookings'], (_req, res) => res.json({ reads: ++reads }));
  app.post('/agency/packages', (_req, res) => res.json({ ok: true }));
  const server = app.listen(0); await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const get = (path = '/tours', headers) => fetch(base + path, { headers }).then(r => r.json());
    assert.equal((await get()).reads, 1);
    assert.equal((await get()).reads, 1);
    assert.equal((await get('/tours', { Authorization: 'Bearer private' })).reads, 2);
    assert.equal((await get('/tours/my-bookings')).reads, 3);
    assert.equal((await get('/tours/my-bookings')).reads, 4);
    await fetch(base + '/agency/packages', { method: 'POST' });
    assert.equal((await get()).reads, 5);
    fail = true;
    assert.equal((await get()).reads, 6);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test('pagination bounds queries and rejects malformed input', () => {
  assert.deepEqual(pagination({ page: '2', limit: '10' }), { page: 2, limit: 10, skip: 10 });
  for (const query of [{ page: '-1' }, { limit: '1000000' }, { page: '1.5' }]) assert.throws(() => pagination(query));
});
