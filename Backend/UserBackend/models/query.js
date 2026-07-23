const mongoose = require("mongoose");

// A contact-form message from the user panel, shown to the admin as a "Query".
const querySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Query", querySchema);
