const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const Job = require('../models/DeliveryJob');
const Query = require('../UserBackend/models/query');
const Notification = require('../UserBackend/models/notification');
const Subscription = require('../UserBackend/models/pushSubscription');
const enabled = () => process.env.BACKGROUND_JOBS_ENABLED === 'true';
const MAX_ATTEMPTS = 5;
const LEASE_MS = 120000;
const retentionDays = Number(process.env.DELIVERY_RETENTION_DAYS || 30);
if (!Number.isSafeInteger(retentionDays) || retentionDays < 1 || retentionDays > 365) {
  throw new Error('DELIVERY_RETENTION_DAYS must be an integer from 1 to 365');
}

async function queueReply(queryId, message) {
  let result;
  await mongoose.connection.transaction(async (session) => {
    const query = await Query.findById(queryId).session(session);
    if (!query) return;
    query.replies.push({ message, status: 'queued', sentAt: null });
    const reply = query.replies[query.replies.length - 1];
    query.isRead = true;
    await query.save({ session });
    await Job.create([{ kind: 'reply', source: query._id, target: reply._id }], { session });
    result = query;
  });
  return result;
}

async function queueNotification(userId, data) {
  let result;
  await mongoose.connection.transaction(async (session) => {
    [result] = await Notification.create([{ ...data, userId }], { session });
    if (require('./webpush').enabled) {
      const subs = await Subscription.find({ userId }).select('_id').session(session).lean();
      if (subs.length) await Job.create(subs.map((sub) => ({ kind: 'push', source: result._id, target: sub._id })), { session });
    }
  });
  return result;
}

async function deliver(job) {
  if (job.kind === 'reply') {
    const query = await Query.findById(job.source);
    const reply = query?.replies.id(job.target);
    if (!reply) return; // Deleted contact messages cancel pending delivery.
    await require('./mailer').sendReplyEmail(query.email, query.name, reply.message, query.message,
      `<misty-${job._id}@delivery.mistymounts.pk>`);
  } else {
    const notification = await Notification.findById(job.source).lean();
    const sub = await Subscription.findById(job.target).lean();
    if (!notification || !sub || String(sub.userId) !== String(notification.userId)) return;
    await require('./webpush').sendPushSubscription(sub, {
      title: notification.title, body: notification.body, link: notification.link || '/notifications',
    });
  }
}

async function processOne(send = deliver) {
  const now = new Date();
  const job = await Job.findOneAndUpdate({ $or: [
    { status: 'queued', availableAt: { $lte: now } },
    { status: 'processing', leaseUntil: { $lte: now } },
  ] }, { $set: { status: 'processing', token: randomUUID(), leaseUntil: new Date(+now + LEASE_MS) },
    $inc: { attempts: 1 } }, { new: true, sort: { availableAt: 1 } });
  if (!job) return false;
  // Renew ownership while a provider call is running. A dead process loses its lease.
  const heartbeat = setInterval(() => {
    Job.updateOne({ _id: job._id, token: job.token, status: 'processing' },
      { $set: { leaseUntil: new Date(Date.now() + LEASE_MS) } }).catch(() => {});
  }, 30000);
  heartbeat.unref();
  let status = 'sent';
  try {
    if (job.attempts > MAX_ATTEMPTS) throw new Error('Retry limit reached');
    await send(job);
  } catch {
    status = job.attempts >= MAX_ATTEMPTS ? 'failed' : 'queued';
  } finally { clearInterval(heartbeat); }
  await mongoose.connection.transaction(async (session) => {
    const update = await Job.updateOne({ _id: job._id, token: job.token, status: 'processing' }, {
      $set: { status, availableAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** (job.attempts - 1))),
        ...(status !== 'queued' ? { completedAt: new Date() } : {}),
        ...(status === 'sent' ? { expiresAt: new Date(Date.now() + retentionDays * 86400000) } : {}) },
      $unset: { token: 1, leaseUntil: 1 },
    }, { session });
    if (update.modifiedCount && job.kind === 'reply') {
      await Query.updateOne({ _id: job.source, 'replies._id': job.target }, {
        $set: { 'replies.$.status': status, 'replies.$.sentAt': status === 'sent' ? new Date() : null },
      }, { session });
    }
  });
  return true;
}
module.exports = { enabled, queueReply, queueNotification, processOne };
