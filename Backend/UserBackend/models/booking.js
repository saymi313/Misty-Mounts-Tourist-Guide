const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accId: { type: String, default: "" }, // accommodation id (frontend deep-link)
    hotel: { type: String, required: true },
    city: { type: String, default: "" },
    image: { type: String, default: "" },
    checkIn: { type: Date },
    nights: { type: Number, default: 1, min: 1 },
    guests: { type: Number, default: 1, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    creditApplied: { type: Number, default: 0 }, // referral credit redeemed on this booking
    status: {
      type: String,
      enum: ["Upcoming", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    ref: { type: String, required: true },
    // Guest contact captured at checkout
    guestName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    hasPromoCode: { type: Boolean, default: false },
    // Manual payment: bank/wallet transfer + uploaded screenshot proof, verified by admin.
    paymentProof: { type: String, default: "" },
    paymentRef: { type: String, default: "" },
    paymentAccountLabel: { type: String, default: "" },
    senderName: { type: String, default: "" },
    paymentStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    // Milestone escrow: once payment is Approved the money is "Held" by the
    // platform; it becomes "Released" (and thus withdrawable by the partner)
    // only when the traveller confirms the stay or admin/auto-release fires on
    // check-out. This is what backs the "escrow-protected" guarantee.
    escrowStatus: { type: String, enum: ["None", "Held", "Released", "Refunded"], default: "None" },
    heldAt: { type: Date },
    releasedAt: { type: Date },
    // Gateway metadata (when paid online rather than by manual proof).
    provider: { type: String, default: "" },
    gatewayTxnId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
