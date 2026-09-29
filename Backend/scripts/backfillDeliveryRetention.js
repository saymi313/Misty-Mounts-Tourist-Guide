require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Job = require('../models/DeliveryJob');
const days = Number(process.env.DELIVERY_RETENTION_DAYS || 30);
(async () => {
  if (!Number.isSafeInteger(days) || days < 1 || days > 365) throw new Error('Invalid retention');
  try {
    await require('../config/db')();
    const result = await Job.updateMany({ status: 'sent', completedAt: { $type: 'date' }, expiresAt: { $exists: false } },
      [{ $set: { expiresAt: { $add: ['$completedAt', days * 86400000] } } }]);
    console.log('Successful jobs assigned retention:', result.modifiedCount);
  } finally { await mongoose.disconnect(); }
})().catch(() => { console.error('Retention backfill failed; check configuration and database access.'); process.exitCode = 1; });
