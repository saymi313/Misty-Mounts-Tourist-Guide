const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

test('two API instances share rate limits and the AI daily budget', { skip: !process.env.REDIS_TEST_URL }, async () => {
  process.env.REDIS_URL = process.env.REDIS_TEST_URL;
  process.env.REDIS_PREFIX = `misty-test:${randomUUID()}:`;
  const express = require('express');
  const { rateLimit } = require('express-rate-limit');
  const sharedLimit = require('../../utils/rateLimitStore');
  const redis = require('../../utils/redis');
  const { claimDailyCall } = require('../../utils/aiQuota');
  const servers = [];
  try {
    for (let i = 0; i < 2; i++) {
      const app = express();
      app.use(rateLimit({ windowMs: 60000, limit: 2, ...sharedLimit('integration') }));
      app.get('/', (_req, res) => res.json({ ok: true }));
      const server = app.listen(0); servers.push(server);
      await new Promise(resolve => server.once('listening', resolve));
    }
    const request = i => fetch(`http://127.0.0.1:${servers[i].address().port}/`);
    assert.equal((await request(0)).status, 200);
    assert.equal((await request(1)).status, 200);
    assert.equal((await request(0)).status, 429);
    const results = await Promise.all(Array.from({ length: 10 }, () => claimDailyCall(3)));
    assert.equal(results.filter(Boolean).length, 3);
  } finally {
    await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
    let cursor = '0';
    do {
      const result = await redis.command(['SCAN', cursor, 'MATCH', `${process.env.REDIS_PREFIX}*`, 'COUNT', '100']);
      cursor = result[0];
      if (result[1].length) await redis.command(['DEL', ...result[1]]);
    } while (cursor !== '0');
    await redis.closeRedis();
  }
});
