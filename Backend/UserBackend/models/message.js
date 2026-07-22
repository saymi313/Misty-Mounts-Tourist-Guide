const mongoose = require("mongoose");

/**
 * A chat message. Conversations are keyed by `userId` — the traveller's id
 * (their email in the current socket contract). `sender` marks who wrote it.
 */
const messageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // the tourist's id (email)
    sender: { type: String, enum: ["user", "guide"], required: true },
    senderName: { type: String, default: "" },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
