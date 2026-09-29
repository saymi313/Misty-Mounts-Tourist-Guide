const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { imageUpload, imageType } = require('../middleware/imageUpload');
const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
test('upload signatures reject SVG and content pretending to be an image', () => {
  assert.equal(imageType(png), 'image/png');
  assert.equal(imageType(Buffer.from('<svg/>')), null);
  assert.equal(imageType(Buffer.from('malicious data')), null);
  assert.equal(imageType(Buffer.from([255, 216, 255])), 'image/jpeg');
});
test('uploads enforce shared-provider configuration, file limits and content types before controllers', async () => {
  const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const saved = keys.map(key => process.env[key]); keys.forEach(key => { process.env[key] = 'test-only'; });
  const app = express(); let accepted = 0;
  app.post('/', (req, _res, next) => { req.user = { id: 'test-user' }; next(); }, ...imageUpload('image', 64), (_req, res) => { accepted++; res.json({ ok: true }); });
  const server = app.listen(0); await new Promise(resolve => server.once('listening', resolve));
  const upload = async (data, type) => { const form = new FormData(); form.append('image', new Blob([data], { type }), 'test.png'); return fetch(`http://localhost:${server.address().port}`, { method: 'POST', body: form }); };
  try {
    assert.equal((await upload(png, 'image/png')).status, 200);
    assert.equal((await upload('not an image', 'image/png')).status, 415);
    assert.equal((await upload(png, 'image/jpeg')).status, 415);
    assert.equal((await upload('<svg/>', 'image/svg+xml')).status, 415);
    assert.equal((await upload(Buffer.alloc(100), 'image/png')).status, 413);
    delete process.env.CLOUDINARY_API_SECRET;
    assert.equal((await upload(png, 'image/png')).status, 503);
    assert.equal(accepted, 1);
  } finally { keys.forEach((key, i) => { if (saved[i] === undefined) delete process.env[key]; else process.env[key] = saved[i]; }); await new Promise(resolve => server.close(resolve)); }
});
