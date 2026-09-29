const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const Query = require('../../UserBackend/models/query');
const Message = require('../../UserBackend/models/message');
const Sub = require('../../UserBackend/models/pushSubscription');
const Job = require('../../models/DeliveryJob');
const User = require('../../LocalGuidePannel/models/User');
const Feedback = require('../../UserBackend/models/feedback');
const Payout = require('../../UserBackend/models/payout');
const Earning = require('../../UserBackend/models/earning');
const { cleanSubscription } = require('../../utils/pushValidation');

test('security boundaries, bounded lists, indexed reads and terminal-only job retention', async () => {
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'isolated-security-test';
  const db = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  let server;
  try {
    await mongoose.connect(db.getUri());
    await Promise.all([Query.init(), Message.init(), Sub.init(), Job.init(), User.init(), Feedback.init()]);
    const owner = new mongoose.Types.ObjectId(), other = new mongoose.Types.ObjectId(), guide = new mongoose.Types.ObjectId();
    const app = express(); app.use(express.json());
    app.use('/queries', require('../../UserBackend/routes/queryRoutes'));
    app.use('/push', require('../../routes/pushRoutes'));
    app.use('/messages', require('../../UserBackend/routes/messageRoutes'));
    app.use('/feedback', require('../../UserBackend/routes/feedbackRoutes'));
    app.use('/auth', require('../../LocalGuidePannel/routes/authRoutes'));
    app.use('/payment', require('../../UserBackend/routes/paymentRoutes'));
    const { authenticate } = require('../../middleware/auth');
    app.put('/profile', authenticate, require('../../UserBackend/controllers/userController').updateMe);
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const call = (path, { id = owner, type = 'user', method = 'GET', body, token } = {}) => fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: '1h' })}` },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    assert.equal((await call('/queries')).status, 403);
    assert.equal((await call('/queries', { type: 'admin', token: jwt.sign({ id: owner, type: 'admin' }, process.env.JWT_SECRET) })).status, 401);
    assert.equal((await call('/queries', { id: 'bad', type: 'admin' })).status, 401);
    await Query.insertMany(Array.from({ length: 25 }, (_, i) => ({ name: 'Test', email: 'test@example.invalid', message: String(i), isRead: i % 2 === 0 })));
    const first = await (await call('/queries?limit=10', { type: 'admin' })).json();
    const second = await (await call('/queries?limit=10&page=2', { type: 'admin' })).json();
    assert.equal(first.queries.length, 10); assert.equal(first.counts.total, 25);
    assert.ok(!second.queries.some((q) => first.queries.some((p) => p._id === q._id)));
    const unread = await (await call('/queries?filter=unread', { type: 'admin' })).json();
    assert.equal(unread.pagination.total, 12); assert.ok(unread.queries.every((q) => !q.isRead));
    assert.equal((await call('/queries?limit=999', { type: 'admin' })).status, 400);
    assert.equal((await call('/queries?limit[]=1', { type: 'admin' })).status, 400);
    const plan = await Query.find({ isRead: false }).sort({ createdAt: -1, _id: -1 }).limit(10).explain('executionStats');
    assert.ok(JSON.stringify(plan.queryPlanner.winningPlan).includes('IXSCAN'));

    const subscription = { endpoint: 'https://fcm.googleapis.com/fcm/send/test', keys: {
      auth: Buffer.alloc(16).toString('base64url'), p256dh: Buffer.concat([Buffer.from([4]), Buffer.alloc(64)]).toString('base64url'),
    } };
    assert.ok(cleanSubscription(subscription));
    for (const endpoint of ['http://127.0.0.1', 'https://169.254.169.254/latest', 'https://fcm.googleapis.com.evil.test/push', 'https://fcm.googleapis.com:8443/push', 'https://user@fcm.googleapis.com/push']) {
      assert.equal((await call('/push/subscribe', { method: 'POST', body: { subscription: { ...subscription, endpoint } } })).status, 400);
    }
    assert.equal((await call('/push/subscribe', { method: 'POST', body: { subscription } })).status, 200);
    assert.equal((await call('/push/subscribe', { id: other, method: 'POST', body: { subscription } })).status, 409);
    await call('/push/unsubscribe', { id: other, method: 'POST', body: { endpoint: subscription.endpoint } });
    assert.equal(await Sub.countDocuments({ userId: owner }), 1);
    await call('/push/unsubscribe', { method: 'POST', body: { endpoint: subscription.endpoint } });
    assert.equal(await Sub.countDocuments(), 0);

    await User.collection.insertOne({ _id: owner, email: 'verified@example.invalid', username: 'tester', type: 'user' });
    assert.equal((await call('/profile', { method: 'PUT', body: { email: 'different@example.invalid' } })).status, 400);
    assert.equal((await User.findById(owner)).email, 'verified@example.invalid');
    assert.equal((await call('/profile', { method: 'PUT', body: { avatar: 'javascript:alert(1)' } })).status, 400);
    await User.updateOne({ _id: owner }, { isVerified: true });
    const bypass = await call('/auth/verify-otp', { method: 'POST', body: { email: 'verified@example.invalid', otp: '123456' } });
    assert.equal(bypass.status, 400); assert.equal((await bypass.json()).token, undefined);
    const bcrypt = require('bcryptjs');
    const otpHash = await bcrypt.hash('123456', 4);
    await User.updateOne({ _id: owner }, { isVerified: false, otp: otpHash, otpPurpose: 'verify', otpAttempts: 0, otpExpires: new Date(Date.now() + 60000) });
    const consumeOtp = require('../../utils/consumeOtp');
    assert.equal(await consumeOtp('verified@example.invalid', '123456', 'reset'), null);
    const claims = await Promise.all(Array.from({ length: 8 }, () => consumeOtp('verified@example.invalid', '123456', 'verify')));
    assert.equal(claims.filter(Boolean).length, 1);
    assert.equal((await User.findById(owner).select('+otp')).otp, undefined);
    await User.updateOne({ _id: owner }, { otp: otpHash, otpPurpose: 'reset', otpAttempts: 0, otpExpires: new Date(Date.now() + 60000) });
    await Promise.all(Array.from({ length: 12 }, () => consumeOtp('verified@example.invalid', '654321', 'reset')));
    assert.equal((await User.findById(owner).select('+otpAttempts')).otpAttempts, 5);
    assert.equal(await consumeOtp('verified@example.invalid', '123456', 'reset'), null);
    await User.updateOne({ _id: owner }, { otp: otpHash, otpPurpose: 'reset', otpAttempts: 0, otpExpires: new Date(Date.now() + 60000) });
    const reset = await call('/auth/reset-password', { method: 'POST', body: { email: 'verified@example.invalid', otp: '123456', password: 'new-test-password' } });
    assert.equal(reset.status, 200); assert.ok((await reset.json()).token);
    assert.ok(await bcrypt.compare('new-test-password', (await User.findById(owner)).password));
    assert.equal((await call('/auth/reset-password', { method: 'POST', body: { email: 'verified@example.invalid', otp: '123456', password: 'replayed-password' } })).status, 400);
    await Feedback.insertMany(Array.from({ length: 25 }, () => ({ userId: owner, locationName: 'Hunza', rating: 5, message: 'Great trip' })));
    const reviews = await (await call('/feedback?kind=general&limit=10&page=2')).json();
    assert.equal(reviews.feedbacks.length, 10); assert.equal(reviews.summary.total, 25); assert.equal(reviews.summary.average, 5);
    assert.equal(reviews.feedbacks[0].userId, undefined);
    assert.equal((await call('/feedback/submit', { method: 'POST', body: { locationName: 'Hunza', rating: 999, message: 'Invalid rating' } })).status, 400);
    await Payout.insertMany(Array.from({ length: 24 }, () => ({ recipientId: owner, recipientType: 'hotel', amount: 100 })));
    await Earning.insertMany(Array.from({ length: 24 }, () => ({ guideId: owner, amount: 100 })));
    for (const [path, key] of [['payouts', 'payouts'], ['earnings', 'earnings']]) {
      const data = await (await call(`/payment/${path}/me?page=2`)).json();
      assert.equal(data[key].length, 4); assert.equal(data.pagination.total, 24);
      assert.equal((await (await call(`/payment/${path}/me`, { id: other })).json())[key].length, 0);
      assert.equal((await call(`/payment/${path}/me?limit=999`)).status, 400);
    }
    await Message.insertMany(Array.from({ length: 75 }, (_, i) => ({ userId: owner, guideId: guide, sender: 'guide', text: String(i) })));
    const thread = await (await call(`/messages/with/${guide}`)).json();
    assert.equal(thread.messages.length, 50); assert.equal(thread.pagination.hasMore, true);
    assert.equal(await Message.countDocuments({ readByUser: false }), 25);
    const older = await (await call(`/messages/with/${guide}?before=${thread.pagination.before}`)).json();
    assert.equal(older.messages.length, 25); assert.equal(older.pagination.hasMore, false);
    assert.ok(!older.messages.some((m) => thread.messages.some((n) => n.id === m.id)));
    assert.equal((await (await call(`/messages/with/${guide}`, { id: other })).json()).messages.length, 0);
    const indexes = await Job.collection.indexes();
    const ttl = indexes.find((index) => index.expireAfterSeconds === 0);
    assert.deepEqual(ttl.key, { expiresAt: 1 });
    assert.deepEqual(ttl.partialFilterExpression, { status: 'sent' });
  } finally {
    if (server) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
    await mongoose.disconnect(); await db.stop();
    if (oldSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldSecret;
  }
});
