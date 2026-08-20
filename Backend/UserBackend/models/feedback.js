const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
    },
    // When the review is about a local guide (vs a location/spot).
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    // The reviewer, plus the booked subject (if any) used to verify the review.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    accId: { type: String, default: "" },
    packageId: { type: String, default: "" },
    // True when the reviewer has an approved booking for this subject.
    verifiedBooking: { type: Boolean, default: false },
    rating: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Display fields the reviews UI uses
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
    date: { type: String, default: "" },
    trip: { type: String, default: "" },
    // Optional traveller-uploaded photo attached to the review.
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
