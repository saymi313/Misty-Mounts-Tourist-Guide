const mongoose = require('mongoose');

const TransportationSchema = new mongoose.Schema({
  // Frontend passes a spot slug; "" means a general option shown for every spot.
  spotId: { type: String, default: "" },
  type: { type: String, default: "" },
  from: { type: String, default: "" },
  to: { type: String, default: "" },
  provider: { type: String, default: "" },
  duration: { type: String, default: "" },
  price: { type: Number, default: 0 },
  schedule: { type: String, default: "" },
  seats: { type: Number, default: 0 },
  // Legacy fields (kept optional for backward compatibility)
  transportType: { type: String },
  Number: { type: Number },
  availability: { type: Boolean, default: true },
});

module.exports = mongoose.model('Transportation', TransportationSchema);
