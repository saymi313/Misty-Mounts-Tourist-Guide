const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  kind: { type: String, enum: ['reply', 'push'], required: true },
  source: { type: mongoose.Schema.Types.ObjectId, required: true },
  target: mongoose.Schema.Types.ObjectId,
  status: { type: String, enum: ['queued', 'processing', 'sent', 'failed'], default: 'queued' },
  attempts: { type: Number, default: 0 },
  availableAt: { type: Date, default: Date.now },
  leaseUntil: Date,
  token: String,
  completedAt: Date,
  expiresAt: Date,
}, { timestamps: true });
schema.index({ kind: 1, source: 1, target: 1 }, { unique: true });
schema.index({ status: 1, availableAt: 1, leaseUntil: 1 });
schema.index({ status: 1, leaseUntil: 1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: 'sent' } });
module.exports = mongoose.model('DeliveryJob', schema);
