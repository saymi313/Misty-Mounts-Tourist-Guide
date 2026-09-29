const mongoose = require("mongoose");

// An earning the admin credits to a local guide (guides have no in-app bookings,
// so their withdrawable balance is built from these admin-recorded credits).
const earningSchema = new mongoose.Schema(
  {
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    guideName: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

earningSchema.index({ guideId: 1, createdAt: -1, _id: -1 });
module.exports = mongoose.model("Earning", earningSchema);
