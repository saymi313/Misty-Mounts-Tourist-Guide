/**
 * Seed MongoDB with the frontend's rich demo content so the reconnected app has
 * data. Loads Frontend/src/data/mockData.js directly (single source of truth) and
 * inserts spots, accommodations, transport, reviews, disasters, an admin, and
 * two test users.
 *
 * Run:  npm run seed        (destructive — replaces the seeded collections)
 */
const mongoose = require("mongoose");
const path = require("path");
const { pathToFileURL } = require("url");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const TouristSpot = require("./AdminBackend/models/TouristSport");
const Accommodation = require("./AdminBackend/models/Accommodation");
const Transportation = require("./AdminBackend/models/Transportation");
const Feedback = require("./UserBackend/models/feedback");
const NaturalDisaster = require("./LocalGuidePannel/models/NaturalDisaster");
const Admin = require("./AdminBackend/models/Admin");
const User = require("./LocalGuidePannel/models/User");

const MOCK_PATH = path.join(__dirname, "..", "Frontend", "src", "data", "mockData.js");

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set in .env");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB. Loading frontend mock data…");

  const mock = await import(pathToFileURL(MOCK_PATH).href);

  // ── Tourist spots (city → nearbyPlaces) ──────────────────────────────────────
  await TouristSpot.deleteMany({});
  const spotDocs = Object.values(mock.spotsByCity).map((c) => ({
    city: c.city,
    heroImage: c.heroImage || "",
    tagline: c.tagline || "",
    isApproved: true,
    nearbyPlaces: (c.nearbyPlaces || []).map((p) => ({
      _id: p._id,
      name: p.name,
      location: p.location,
      description: p.description,
      picture: p.picture,
      latitude: p.latitude,
      longitude: p.longitude,
      elevation: p.elevation,
      bestTime: p.bestTime,
      activities: p.activities || [],
      hiddenGem: !!p.hiddenGem,
      curatedBy: p.curatedBy || "",
    })),
  }));
  await TouristSpot.insertMany(spotDocs);
  console.log(`✓ ${spotDocs.length} cities seeded`);

  // ── Accommodations ───────────────────────────────────────────────────────────
  await Accommodation.deleteMany({});
  const accs = mock.accommodations.map((a) => ({
    _id: a._id,
    name: a.name,
    type: a.type,
    location: a.location,
    city: a.city,
    description: a.description,
    price: a.price,
    picture: a.picture,
    rating: a.rating,
    reviews: a.reviews,
    amenities: a.amenities || [],
    tags: a.tags || [],
  }));
  await Accommodation.insertMany(accs);
  console.log(`✓ ${accs.length} accommodations seeded`);

  // ── Transportation (general list — mock uses the same set for every spot) ────
  await Transportation.deleteMany({});
  const transports = (mock.transportationBySpot?.default || []).map((t) => ({
    spotId: "",
    type: t.type,
    from: t.from,
    to: t.to,
    provider: t.provider,
    duration: t.duration,
    price: t.price,
    schedule: t.schedule,
    seats: t.seats,
  }));
  await Transportation.insertMany(transports);
  console.log(`✓ ${transports.length} transportation options seeded`);

  // ── Reviews ──────────────────────────────────────────────────────────────────
  await Feedback.deleteMany({});
  const feedbacks = mock.feedbacks.map((f) => ({
    locationName: f.locationName,
    rating: f.rating,
    message: f.message,
    name: f.name || "",
    avatar: f.avatar || "",
    date: f.date || "",
    trip: f.trip || "",
  }));
  await Feedback.insertMany(feedbacks);
  console.log(`✓ ${feedbacks.length} reviews seeded`);

  // ── Natural-disaster alerts ──────────────────────────────────────────────────
  await NaturalDisaster.deleteMany({});
  const disasters = mock.disasters.map((d) => ({
    name: d.name,
    location: d.location,
    description: d.description,
    date: d.date,
    severity: d.severity,
    isResolved: !!d.isResolved,
  }));
  await NaturalDisaster.insertMany(disasters);
  console.log(`✓ ${disasters.length} disaster alerts seeded`);

  // ── Admin (idempotent; credentials come from .env, never hardcoded) ───────────
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminUsername && adminEmail && adminPassword) {
    if (!(await Admin.findOne({ $or: [{ username: adminUsername }, { email: adminEmail }] }))) {
      await Admin.create({
        username: adminUsername,
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
      });
      console.log(`✓ admin seeded  (${adminUsername})`);
    } else {
      console.log("• admin already exists");
    }
  } else {
    console.log("• admin skipped — set ADMIN_USERNAME/ADMIN_EMAIL/ADMIN_PASSWORD in .env");
  }

  // ── Test users (idempotent; model pre-save hook hashes the password) ─────────
  const testUsers = [
    { email: "test@example.com", username: "testuser", type: "user", name: "Zara Ahmed", isVerified: true },
    { email: "guide@example.com", username: "guidekarim", type: "local guide", name: "Karim Ali", isVerified: true },
  ];
  for (const u of testUsers) {
    if (!(await User.findOne({ email: u.email }))) {
      await User.create({ ...u, password: "password123" });
      console.log(`✓ ${u.type} seeded  (${u.email} / password123)`);
    } else {
      console.log(`• ${u.email} already exists`);
    }
  }

  await mongoose.disconnect();
  console.log("\nSeeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
