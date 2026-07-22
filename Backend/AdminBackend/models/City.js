const mongoose = require("mongoose");

// A city/valley the admin curates. Its photo is shown in the traveller panel and
// its name feeds the "city" dropdown when adding tourist spots.
const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    photo: { type: String, default: "" },
    tagline: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("City", citySchema);
