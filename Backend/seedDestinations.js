/**
 * Seed real Northern-Pakistan destinations into the TouristSpot collection.
 * Idempotent: upserts each city by name (re-running refreshes these cities'
 * spots without touching other collections or other cities). Run with:
 *   node seedDestinations.js
 */
const mongoose = require("mongoose");
require("dotenv").config();

const TouristSpot = require("./AdminBackend/models/TouristSport");
const City = require("./AdminBackend/models/City");
const cities = require("./data/destinations");

(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in Backend/.env");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB. Seeding destinations...\n");

    let cityCount = 0;
    let spotCount = 0;
    for (const c of cities) {
      await TouristSpot.findOneAndUpdate(
        { city: c.city },
        {
          $set: {
            city: c.city,
            heroImage: c.heroImage || "",
            tagline: c.tagline || "",
            isApproved: true,
            nearbyPlaces: c.nearbyPlaces.map((p) => ({ ...p, isApproved: true })),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // Keep the City registry (admin manager + Destinations grid) in sync.
      await City.findOneAndUpdate(
        { name: c.city },
        { $set: { name: c.city, province: c.province || "", photo: c.heroImage || "", tagline: c.tagline || "" } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      cityCount += 1;
      spotCount += c.nearbyPlaces.length;
      console.log(`  ${c.city.padEnd(16)} ${c.nearbyPlaces.length} spots  (${c.province})`);
    }

    console.log(`\nDone. Upserted ${cityCount} cities and ${spotCount} spots.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
})();
