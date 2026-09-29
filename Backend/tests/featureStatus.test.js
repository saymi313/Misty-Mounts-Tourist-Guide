const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { router, featureStatus } = require('../routes/featureRoutes');

test('configuration flags default to unavailable and never expose credentials', () => {
  assert.deepEqual(featureStatus({}), { gemini: false, whatsapp: false, whatsappAutomation: false });
  assert.equal(featureStatus({ GEMINI_API_KEY: '   ' }).gemini, false);
  const flags = featureStatus({ GEMINI_API_KEY: 'secret-key', CONCIERGE_WHATSAPP_NUMBER: '923001234567' });
  assert.deepEqual(flags, { gemini: true, whatsapp: true, whatsappAutomation: false });
  assert.equal(JSON.stringify(flags).includes('secret-key'), false);
  assert.equal(featureStatus({ CONCIERGE_WHATSAPP_NUMBER: '+92 invalid' }).whatsapp, false);
});

test('availability endpoint is public and cannot be cached', async () => {
  const app = express(); app.use('/features', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/features`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(Object.keys(await response.json()).sort(), ['gemini', 'whatsapp', 'whatsappAutomation']);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
