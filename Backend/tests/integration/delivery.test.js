const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const Job = require('../../models/DeliveryJob');
const Query = require('../../UserBackend/models/query');
const { queueReply, processOne } = require('../../utils/deliveryJobs');

test('durable deliveries: atomic enqueue, exclusive claims, retries and lease recovery', async () => {
  const db = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  try {
    await mongoose.connect(db.getUri());
    await Promise.all([Job.init(), Query.init()]);
    const query = await Query.create({ name: 'Test', email: 'test@example.invalid', message: 'Hello' });
    const updated = await queueReply(query._id, 'Reply');
    assert.equal(updated.replies[0].status, 'queued');
    assert.equal(updated.replies[0].sentAt, null);
    assert.equal(await Job.countDocuments(), 1);
    let sends = 0;
    await Promise.all(Array.from({ length: 8 }, () => processOne(async () => { sends++; })));
    assert.equal(sends, 1);
    assert.equal((await Query.findById(query._id)).replies[0].status, 'sent');
    assert.ok((await Job.findOne({ status: 'sent' })).expiresAt > new Date());
    assert.equal(await processOne(async () => { sends++; }), false);

    await queueReply(query._id, 'Retry me');
    const retry = await Job.findOne({ status: 'queued' });
    for (let attempt = 1; attempt <= 5; attempt++) {
      await processOne(async () => { throw new Error('Simulated provider outage'); });
      const current = await Job.findById(retry._id);
      assert.equal(current.attempts, attempt);
      assert.equal(current.status, attempt === 5 ? 'failed' : 'queued');
      if (attempt < 5) {
        assert.ok(current.availableAt > new Date());
        assert.equal(await processOne(async () => assert.fail('Backoff bypassed')), false);
        await Job.updateOne({ _id: retry._id }, { availableAt: new Date(0) });
      }
    }
    assert.equal((await Query.findById(query._id)).replies[1].status, 'failed');
    assert.equal((await Job.findById(retry._id)).expiresAt, undefined);
    await queueReply(query._id, 'Recover after crash');
    await Job.updateOne({ status: 'queued' }, { status: 'processing', leaseUntil: new Date(0), token: 'dead-worker' });
    assert.equal(await processOne(async () => { sends++; }), true);
    assert.equal(sends, 2);

    await queueReply(query._id, 'Ownership fencing');
    await processOne(async (job) => {
      await Job.updateOne({ _id: job._id }, { token: 'another-worker' });
    });
    assert.equal((await Query.findById(query._id)).replies[3].status, 'queued');
    assert.equal(await Job.countDocuments({ status: 'processing' }), 1);
    assert.equal(await queueReply(new mongoose.Types.ObjectId(), 'Missing'), undefined);
    assert.equal(await Job.countDocuments(), 4);
    const originalCreate = Job.create;
    Job.create = async () => { throw new Error('Simulated enqueue failure'); };
    try { await assert.rejects(queueReply(query._id, 'Must roll back')); }
    finally { Job.create = originalCreate; }
    assert.equal((await Query.findById(query._id)).replies.length, 4);
  } finally {
    await mongoose.disconnect();
    await db.stop();
  }
});
