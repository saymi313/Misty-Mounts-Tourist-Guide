const mongoose = require("mongoose");

// A browser Web-Push subscription tied to a user (a user may have several — one
// per device/browser). Keyed by the unique push endpoint.
const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    subscription: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);
