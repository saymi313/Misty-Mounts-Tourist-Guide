const mongoose = require("mongoose");

/**
 * A traveller's reservation of seats on a fixed group departure of a tour
 * package. Mirrors the payment shape of `booking.js` so it flows through the
 * same admin verification pattern. `agencyId` is denormalized so agency revenue
 * (computeBalance) and the agency Bookings page can query without a join.
 */
const tourBookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    packageId: { type: String, ref: "TourPackage", required: true, index: true },
    packageTitle: { type: String, default: "" },
    city: { type: String, default: "" },
    image: { type: String, default: "" },

    departureId: { type: String, default: "" },
    departureDate: { type: Date },

    seats: { type: Number, required: true, min: 1 },
    pricePerPerson: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },

    status: { type: String, enum: ["Upcoming", "Completed", "Cancelled"], default: "Upcoming" },
    ref: { type: String, required: true },

    guestName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },

    paymentProof: { type: String, default: "" },
    paymentRef: { type: String, default: "" },
    paymentAccountLabel: { type: String, default: "" },
    senderName: { type: String, default: "" },
    paymentStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TourBooking", tourBookingSchema);
