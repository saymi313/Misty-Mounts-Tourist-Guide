const TouristSpot = require("../models/TouristSport");
const { slugify } = require("../../utils/slug");
const { getAutoApprove } = require("./settingsController");

// Build a slug from the name that's unique across every place (used as the _id,
// so spot routes read /city/:city/spot/attabad-lake instead of a raw ObjectId).
const uniquePlaceSlug = async (name) => {
  const base = slugify(name);
  const docs = await TouristSpot.find().select("nearbyPlaces._id");
  const used = new Set(docs.flatMap((d) => d.nearbyPlaces.map((p) => String(p._id))));
  let slug = base;
  let i = 2;
  while (used.has(slug)) slug = `${base}-${i++}`;
  return slug;
};

// Flatten a city document's nearby places into the flat shape the admin/guide
// spot lists use (each place carries its city + parent doc id).
const flatten = (doc) =>
  doc.nearbyPlaces.map((p) => ({
    _id: p._id,
    name: p.name,
    location: p.location,
    description: p.description,
    picture: p.picture,
    city: doc.city,
    parentId: doc._id,
    latitude: p.latitude,
    longitude: p.longitude,
    elevation: p.elevation,
    bestTime: p.bestTime,
    activities: p.activities || [],
    hiddenGem: !!p.hiddenGem,
    curatedBy: p.curatedBy || "",
    isApproved: p.isApproved !== false,
  }));

const PLACE_FIELDS = [
  "name", "location", "description", "picture", "latitude", "longitude",
  "elevation", "bestTime", "activities", "hiddenGem", "curatedBy", "isApproved",
];

// GET /api/admin/places — every place across all cities, flattened.
exports.getAllPlaces = async (req, res) => {
  try {
    const docs = await TouristSpot.find();
    res.json({ places: docs.flatMap(flatten) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch places" });
  }
};

// POST /api/admin/places — add a place to a city (creating the city if needed).
exports.createPlace = async (req, res) => {
  try {
    const { city } = req.body;
    if (!city || !req.body.name) {
      return res.status(400).json({ error: "city and name are required" });
    }
    let doc = await TouristSpot.findOne({ city });
    if (!doc) doc = new TouristSpot({ city, nearbyPlaces: [], isApproved: true });

    const place = { _id: await uniquePlaceSlug(req.body.name) };
    for (const f of PLACE_FIELDS) if (f in req.body) place[f] = req.body[f];

    // Approval gate: admins create approved spots directly; local-guide
    // submissions wait for review unless auto-approval is enabled. Guides can
    // never approve their own spot, so the client-sent value is ignored here.
    if (req.user?.type === "local guide") {
      place.isApproved = await getAutoApprove();
    } else {
      place.isApproved = "isApproved" in req.body ? !!req.body.isApproved : true;
    }

    doc.nearbyPlaces.push(place);
    await doc.save();

    res.status(201).json({ place: flatten(doc).find((p) => String(p._id) === place._id) });
  } catch (err) {
    console.error("createPlace error:", err.message);
    res.status(500).json({ error: "Failed to create place" });
  }
};

// PUT /api/admin/places/:id — update a place by its id.
exports.updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await TouristSpot.findOne({ "nearbyPlaces._id": id });
    if (!doc) return res.status(404).json({ error: "Place not found" });

    const place = doc.nearbyPlaces.id(id);
    const isAdmin = req.user?.type === "admin";
    for (const f of PLACE_FIELDS) {
      // Only admins may change approval — guides can't self-approve via edit.
      if (f === "isApproved" && !isAdmin) continue;
      if (f in req.body) place[f] = req.body[f];
    }
    await doc.save();
    res.json({ place: flatten(doc).find((p) => String(p._id) === String(id)) });
  } catch (err) {
    res.status(500).json({ error: "Failed to update place" });
  }
};

// PATCH /api/admin/places/:id/approve — admin approves (or unapproves) a place.
exports.approvePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await TouristSpot.findOne({ "nearbyPlaces._id": id });
    if (!doc) return res.status(404).json({ error: "Place not found" });
    const place = doc.nearbyPlaces.id(id);
    place.isApproved = "isApproved" in req.body ? !!req.body.isApproved : true;
    await doc.save();
    res.json({ place: flatten(doc).find((p) => String(p._id) === String(id)) });
  } catch (err) {
    res.status(500).json({ error: "Failed to update approval" });
  }
};

// DELETE /api/admin/places/:id — remove a place by its id.
exports.deletePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await TouristSpot.findOne({ "nearbyPlaces._id": id });
    if (!doc) return res.status(404).json({ error: "Place not found" });
    doc.nearbyPlaces.pull(id);
    await doc.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete place" });
  }
};
