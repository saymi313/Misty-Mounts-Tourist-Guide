const mongoose = require("mongoose");

const naturalDisasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  severity: { type: String, required: true, enum: ["Low", "Medium", "High"] },
  affectedAreas: [{ type: String }],
  isResolved: { type: Boolean, default: false },
  createdBy: { type: String, default: "" }, // owner user id for permission checks
});

module.exports = mongoose.model("NaturalDisaster", naturalDisasterSchema);
