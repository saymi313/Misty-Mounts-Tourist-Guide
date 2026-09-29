require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Job = require('../models/DeliveryJob');
(async () => {
  try {
    await require('../config/db')();
    console.table(await Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, oldest: { $min: '$createdAt' } } }]));
    console.log('Expired worker leases:', await Job.countDocuments({ status: 'processing', leaseUntil: { $lte: new Date() } }));
  } finally { await mongoose.disconnect(); }
})().catch(() => { console.error('Unable to read delivery status.'); process.exitCode = 1; });
