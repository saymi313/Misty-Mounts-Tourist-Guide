const mongoose = require("mongoose");

// A contact-form message from the user panel, shown to the admin as a "Query".
const querySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    // Admin replies sent back to the sender's email (newest appended).
    replies: [
      {
        message: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Query", querySchema);
