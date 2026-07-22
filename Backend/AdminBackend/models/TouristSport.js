const mongoose = require("mongoose");

// A place within a city. `_id` is a string so the frontend's slug ids
// (e.g. "hunza-attabad") survive seeding and keep deep-links working; app-created
// places fall back to a generated id.
const nearbyPlaceSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  location: { type: String, default: "" },
  description: { type: String, default: "" },
  picture: { type: String, default: "" },
  latitude: { type: Number },
  longitude: { type: Number },
  elevation: { type: String, default: "" },
  bestTime: { type: String, default: "" },
  activities: { type: [String], default: [] },
  hiddenGem: { type: Boolean, default: false },
  curatedBy: { type: String, default: "" },
  // Who added this spot — captured server-side at creation (can't be spoofed).
  uploaderRole: { type: String, enum: ["", "admin", "local guide"], default: "" },
  uploaderName: { type: String, default: "" },
  isApproved: { type: Boolean, default: true },
});

// A city and its places.
const touristSpotSchema = new mongoose.Schema({
  city: { type: String, required: true },
  heroImage: { type: String, default: "" },
  tagline: { type: String, default: "" },
  nearbyPlaces: [nearbyPlaceSchema],
  isApproved: { type: Boolean, default: false },
});

module.exports = mongoose.model("TouristSpot", touristSpotSchema);
