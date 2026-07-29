const mongoose = require("mongoose");

/**
 * A 1:1 chat message between a traveller (`userId`) and a local guide
 * (`guideId`). Both reference the shared User collection. A single row serves
 * both inboxes: `sender` marks which side wrote it, and the two read flags track
 * whether each side has seen it. A conversation is the set of messages sharing
 * the same (userId, guideId) pair.
 */
const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },  // traveller
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // local guide
    sender: { type: String, enum: ["user", "guide"], required: true },
    text: { type: String, required: true, trim: true, maxlength: 4000 },
    readByUser: { type: Boolean, default: false },
    readByGuide: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fast lookup of one conversation in chronological order.
messageSchema.index({ userId: 1, guideId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
