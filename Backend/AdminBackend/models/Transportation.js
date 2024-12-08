const mongoose = require('mongoose');

const TransportationSchema = new mongoose.Schema({
  spotId: { type: mongoose.Schema.Types.ObjectId, ref: 'TouristSpot', required: true },
  transportType: { type: String, required: true },
  Number: { type: Number, required: true },
  availability: { type: Boolean, default: true },
});

module.exports = mongoose.model('Transportation', TransportationSchema);
