/**
 * One-off migration: replace raw ObjectId-style ids on tourist spots and
 * accommodations with readable slugs derived from their names.
 *
 *   npm run migrate:slugs
 *
 * NOTE: this changes _id values, so any saved-spot / booking references to the
 * OLD ids won't resolve afterwards (fine for demo data; re-save if needed).
 */
const mongoose = require("mongoose");
require("dotenv").config();

const TouristSpot = require("./AdminBackend/models/TouristSport");
const Accommodation = require("./AdminBackend/models/Accommodation");
const { slugify } = require("./utils/slug");

const isObjectIdish = (id) => /^[a-f0-9]{24}$/i.test(String(id));

async function migrate() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set in .env");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Re-slugging ObjectId-style ids…");

  // ── Tourist spots (nearby places) ───────────────────────────────────────────
  const spotDocs = await TouristSpot.find();
  const usedPlaceIds = new Set(spotDocs.flatMap((d) => d.nearbyPlaces.map((p) => String(p._id))));
  let placeCount = 0;
  for (const doc of spotDocs) {
    let dirty = false;
    const places = doc.nearbyPlaces.map((p) => p.toObject());
    for (const p of places) {
      if (isObjectIdish(p._id)) {
        usedPlaceIds.delete(String(p._id));
        const base = slugify(p.name);
        let slug = base;
        let i = 2;
        while (usedPlaceIds.has(slug)) slug = `${base}-${i++}`;
        usedPlaceIds.add(slug);
        p._id = slug;
        dirty = true;
        placeCount++;
      }
    }
    if (dirty) {
      doc.nearbyPlaces = places; // reassign so Mongoose rebuilds subdocs with new ids
      await doc.save();
    }
  }
  console.log(`✓ ${placeCount} tourist spots re-slugged`);

  // ── Accommodations (top-level _id is immutable → recreate) ──────────────────
  const accs = await Accommodation.find();
  const usedAccIds = new Set(accs.map((a) => String(a._id)));
  let accCount = 0;
  for (const acc of accs) {
    if (isObjectIdish(acc._id)) {
      usedAccIds.delete(String(acc._id));
      const base = slugify(acc.name);
      let slug = base;
      let i = 2;
      while (usedAccIds.has(slug)) slug = `${base}-${i++}`;
      usedAccIds.add(slug);
      const data = acc.toObject();
      data._id = slug;
      await Accommodation.create(data);
      await Accommodation.deleteOne({ _id: acc._id });
      accCount++;
    }
  }
  console.log(`✓ ${accCount} accommodations re-slugged`);

  await mongoose.disconnect();
  console.log("Migration complete.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
