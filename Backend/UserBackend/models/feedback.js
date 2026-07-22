const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
    },
    // When the review is about a local guide (vs a location/spot).
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
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
  },
  { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
