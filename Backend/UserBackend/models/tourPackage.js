const mongoose = require("mongoose");

/**
 * A tour package authored by a travel agency: a multi-day, multi-spot itinerary
 * with hotel stays, a per-person price, and one or more fixed group departures
 * (each with a seat capacity). `_id` is a readable slug (like Accommodation), so
 * /tours/:id is friendly.
 *
 * Hybrid content: spots and hotels may either LINK an existing catalog id
 * (spotId / accId) or be free-form entries the agency types itself.
 */
const spotRefSchema = new mongoose.Schema(
  { spotId: { type: String, default: "" }, name: { type: String, required: true }, city: { type: String, default: "" } },
  { _id: false }
);

const hotelRefSchema = new mongoose.Schema(
  {
    accId: { type: String, default: "" },
    name: { type: String, required: true },
    city: { type: String, default: "" },
    nights: { type: Number, default: 1, min: 0 },
  },
  { _id: false }
);

const itineraryDaySchema = new mongoose.Schema(
  { day: { type: Number, required: true }, title: { type: String, default: "" }, detail: { type: String, default: "" } },
  { _id: false }
);

const departureSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  seatsTotal: { type: Number, required: true, min: 1 },
  seatsBooked: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ["open", "closed"], default: "open" },
});

const tourPackageSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() }, // slug on create
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    images: { type: [String], default: [] },
    cities: { type: [String], default: [] },
    durationDays: { type: Number, default: 1, min: 1 },
    pricePerPerson: { type: Number, required: true, min: 0 },
    spots: { type: [spotRefSchema], default: [] },
    hotels: { type: [hotelRefSchema], default: [] },
    itinerary: { type: [itineraryDaySchema], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    departures: { type: [departureSchema], default: [] },
    isApproved: { type: Boolean, default: false }, // set from autoApprovePackages on create
    isPublished: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TourPackage", tourPackageSchema);
