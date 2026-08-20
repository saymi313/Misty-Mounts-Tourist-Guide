const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  type: { type: String, enum: ["hotel", "food"], default: "hotel" },
  // Owner (a 'hotel' user) — null means admin-created. Approval gates traveller visibility.
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  isApproved: { type: Boolean, default: true },
  location: { type: String, default: "" },
  city: { type: String, default: "" },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  picture: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  amenities: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  isAvailable: { type: Boolean, default: true },
  specialOffer: { type: String, default: "" },
  // Operator tooling: booking mode + date-based availability. blackoutDates holds
  // "YYYY-MM-DD" strings the owner has marked unavailable; a check-in that falls
  // on any occupied blackout night is rejected at booking time.
  bookingMode: { type: String, enum: ["instant", "request"], default: "request" },
  blackoutDates: { type: [String], default: [] },
});

module.exports = mongoose.model("Accommodation", accommodationSchema);
