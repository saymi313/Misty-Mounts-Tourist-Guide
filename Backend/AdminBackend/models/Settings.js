const mongoose = require("mongoose");

// Single global settings document for platform-wide toggles.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    // When true, tourist spots submitted by local guides are approved on
    // creation instead of waiting in the admin moderation queue.
    autoApproveSpots: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fetch (or lazily create) the one global settings document.
settingsSchema.statics.getGlobal = async function () {
  let doc = await this.findOne({ key: "global" });
  if (!doc) doc = await this.create({ key: "global" });
  return doc;
};

module.exports = mongoose.model("Settings", settingsSchema);
