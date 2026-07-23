const mongoose = require("mongoose");

// A manual fund transfer the admin records from the platform to a hotel or
// local guide (after the platform's margin). Tracked so recipients see what
// they've been paid on their revenue page.
const payoutSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientName: { type: String, default: "" },
    recipientType: { type: String, enum: ["hotel", "local guide"], required: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "" },
    // Partner-initiated withdrawal request the admin verifies.
    accountDetails: { type: String, default: "" },
    status: { type: String, enum: ["Requested", "Approved", "Rejected"], default: "Requested" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payout", payoutSchema);
