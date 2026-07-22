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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
