const mongoose = require("mongoose");

const naturalDisasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  severity: { type: String, required: true, enum: ["Low", "Medium", "High"] },
  affectedAreas: [{ type: String }],
  isResolved: { type: Boolean, default: false },
});

module.exports = mongoose.model("NaturalDisaster", naturalDisasterSchema);
