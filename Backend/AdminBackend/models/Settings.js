const mongoose = require("mongoose");

// Single global settings document for platform-wide toggles.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    // When true, tourist spots submitted by local guides are approved on
    // creation instead of waiting in the admin moderation queue.
    autoApproveSpots: { type: Boolean, default: false },
    // When true, hotel-manager listings are approved on creation instead of
    // waiting in the admin moderation queue.
    autoApproveListings: { type: Boolean, default: false },
    // Revenue: the platform's commission %, and the accounts travellers pay into.
    commissionPercent: { type: Number, default: 15, min: 0, max: 100 },
    // Minimum available balance a partner needs before requesting a payout.
    minPayoutThreshold: { type: Number, default: 5000, min: 0 },
    paymentAccounts: {
      type: [
        {
          _id: false,
          label: { type: String, default: "" },
          bank: { type: String, default: "" },
          accountName: { type: String, default: "" },
          accountNumber: { type: String, default: "" },
          instructions: { type: String, default: "" },
        },
      ],
      default: [],
    },
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
