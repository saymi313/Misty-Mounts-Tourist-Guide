const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  picture:{type: String, required:true },
  isAvailable: { type: Boolean, default: true },
  specialOffer: { type: String, default: "" },
});

module.exports = mongoose.model("Accommodation", accommodationSchema);
