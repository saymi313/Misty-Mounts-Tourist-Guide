const mongoose = require("mongoose");

// Email capture for early-access / deals — the top of the growth funnel.
const waitlistSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Waitlist", waitlistSchema);
