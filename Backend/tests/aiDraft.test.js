const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const { validateDraft } = require('../utils/aiDraft');

test('draft validation requires source text, valid modes and bounded facts', () => {
  const valid = { mode: 'description', language: 'en', facts: { name: 'Lake House', city: 'Hunza' } };
  assert.equal(validateDraft(valid).facts.name, 'Lake House');
  for (const input of [null, { ...valid, mode: 'publish' }, { ...valid, language: 'xx' }, { ...valid, facts: {} }, { ...valid, facts: { name: 'x'.repeat(3001) } }, { ...valid, mode: 'translate', source: '' }, { ...valid, mode: 'guest-reply', source: {} }]) assert.throws(() => validateDraft(input));
  assert.deepEqual(validateDraft({ ...valid, facts: { ...valid.facts, secret: 'ignored' } }).facts, valid.facts);
});

test('draft API enforces provider roles, returns editable content, and does not cache guest text', { timeout: 15000 }, async () => {
  const original = { fetch: global.fetch, key: process.env.GEMINI_API_KEY, secret: process.env.JWT_SECRET };
  process.env.JWT_SECRET = 'test-secret'; process.env.GEMINI_API_KEY = 'test-key';
  let providerCalls = 0, fail = false;
  global.fetch = async (_url, options) => {
    providerCalls++;
    const body = JSON.parse(options.body);
    assert.match(body.systemInstruction.parts[0].text, /Never invent/);
    assert.equal(JSON.parse(body.contents[0].parts[0].text).source, 'Is breakfast included?');
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: fail ? 'invalid json' : JSON.stringify({ text: 'Please confirm your preferred dates so we can check the details.' }) }] } }] }) };
  };
  const app = express(); app.use(express.json()); app.use('/ai', require('../routes/aiRoutes'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const body = { mode: 'guest-reply', language: 'en', facts: { name: 'Lake House' }, source: 'Is breakfast included?' };
  const request = role => original.fetch(`http://127.0.0.1:${server.address().port}/ai/draft`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(role ? { Authorization: `Bearer ${jwt.sign({ id: '000000000000000000000001', type: role }, process.env.JWT_SECRET, { expiresIn: '1h' })}` } : {}) }, body: JSON.stringify(body) });
  try {
    assert.equal((await request()).status, 401);
    assert.equal((await request('user')).status, 403);
    assert.equal(providerCalls, 0);
    const response = await request('hotel');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.json()).draft, true);
    assert.equal((await request('local guide')).status, 200);
    assert.equal(providerCalls, 2);
    fail = true;
    assert.equal((await request('hotel')).status, 503);
  } finally {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    global.fetch = original.fetch;
    for (const [key, value] of [['GEMINI_API_KEY', original.key], ['JWT_SECRET', original.secret]]) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});
