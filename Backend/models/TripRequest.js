const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  ref: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  supplierName: String,
  service: { type: String, enum: ['complete trip', 'stay', 'guide', 'transport'], required: true },
  destination: String, startDate: String, endDate: String, people: Number, budget: Number,
  requirements: String, itinerary: String,
  requestKey: { type: String, required: true },
  status: { type: String, enum: ['requested', 'quoted', 'declined', 'accepted', 'paid', 'completed', 'cancelled', 'refund_requested', 'refunded'], default: 'requested', index: true },
  quote: {
    items: [{ label: String, quantity: Number, unitPrice: Number, total: Number }],
    total: Number, currency: { type: String, default: 'PKR' }, terms: String, exclusions: String,
    expiresAt: Date, confirmedAt: Date, commissionPercent: Number,
  },
  acceptedAt: Date, paidAt: Date, completedAt: Date,
  paymentReference: { type: String }, paymentProvider: String,
  refundReference: String, refundAmount: Number, refundNote: String,
  payoutReference: String, payoutAmount: Number,
  review: { rating: Number, text: String, createdAt: Date },
  support: { message: String, resolution: String, openedAt: Date, closedAt: Date, minutes: { type: Number, default: 0 } },
  history: [{ action: String, actor: String, at: Date }],
}, { timestamps: true });
schema.index({ userId: 1, requestKey: 1 }, { unique: true });
schema.index({ paymentReference: 1 }, { unique: true, sparse: true });
schema.index({ userId: 1, createdAt: -1 });
schema.index({ supplierId: 1, createdAt: -1 });
module.exports = mongoose.model('TripRequest', schema);
