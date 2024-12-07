const mongoose = require("mongoose");

// Define the structure for nearbyPlaces
const nearbyPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  picture: { type: String, required: true },
});

// Define the structure for the main tourist spot
const touristSpotSchema = new mongoose.Schema({
  city: { type: String, required: true },
  nearbyPlaces: [nearbyPlaceSchema], // Array of nearby places
  isApproved: { type: Boolean, default: false },

});

module.exports = mongoose.model("TouristSpot", touristSpotSchema);
