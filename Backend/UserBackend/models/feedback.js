const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
