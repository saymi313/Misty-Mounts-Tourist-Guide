const TourPackage = require("../../UserBackend/models/tourPackage");
const TourBooking = require("../../UserBackend/models/tourBooking");
const User = require("../../LocalGuidePannel/models/User");
const { slugify } = require("../../utils/slug");
const { getAutoApprovePackages } = require("../../AdminBackend/controllers/settingsController");

// Unique slug from the title → used as the package _id so /tours/:id is readable.
const uniquePkgSlug = async (title) => {
  const base = slugify(title);
  const used = new Set((await TourPackage.find().select("_id")).map((p) => String(p._id)));
  let slug = base;
  let i = 2;
  while (used.has(slug)) slug = `${base}-${i++}`;
  return slug;
};

// Fields an agency may set on their own package.
const OWNER_FIELDS = [
  "title", "summary", "coverImage", "images", "cities", "durationDays",
  "pricePerPerson", "spots", "hotels", "itinerary", "inclusions", "exclusions",
  "departures", "isPublished",
];

// GET /api/agency/packages — the signed-in agency's own packages.
exports.listMyPackages = async (req, res) => {
  try {
    const items = await TourPackage.find({ agencyId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("listMyPackages error:", err.message);
    res.status(500).json({ error: "Failed to load your packages" });
  }
};

// POST /api/agency/packages — create a package owned by this agency.
exports.createMyPackage = async (req, res) => {
  try {
    // The agency account must be admin-approved before it can publish tours.
    const me = await User.findById(req.user.id).select("isApproved");
    if (me && me.isApproved === false) {
      return res.status(403).json({ error: "Your agency is pending admin approval." });
    }
    if (!req.body.title || req.body.pricePerPerson == null) {
      return res.status(400).json({ error: "title and pricePerPerson are required" });
    }
    const doc = { _id: await uniquePkgSlug(req.body.title), agencyId: req.user.id };
    for (const f of OWNER_FIELDS) if (f in req.body) doc[f] = req.body[f];
    // Approval gate: pending unless the admin enabled auto-approval.
    doc.isApproved = await getAutoApprovePackages();
    const pkg = await TourPackage.create(doc);
    res.status(201).json({ message: "Package created", package: pkg });
  } catch (err) {
    console.error("createMyPackage error:", err.message);
    res.status(500).json({ error: "Failed to create package" });
  }
};

// PUT /api/agency/packages/:id — update own package (can't self-approve).
exports.updateMyPackage = async (req, res) => {
  try {
    const doc = await TourPackage.findOne({ _id: req.params.id, agencyId: req.user.id });
    if (!doc) return res.status(404).json({ error: "Package not found" });
    for (const f of OWNER_FIELDS) if (f in req.body) doc[f] = req.body[f];
    await doc.save();
    res.json({ message: "Package updated", package: doc });
  } catch (err) {
    console.error("updateMyPackage error:", err.message);
    res.status(500).json({ error: "Failed to update package" });
  }
};

// DELETE /api/agency/packages/:id — delete own package.
exports.deleteMyPackage = async (req, res) => {
  try {
    const doc = await TourPackage.findOneAndDelete({ _id: req.params.id, agencyId: req.user.id });
    if (!doc) return res.status(404).json({ error: "Package not found" });
    res.json({ message: "Package deleted" });
  } catch (err) {
    console.error("deleteMyPackage error:", err.message);
    res.status(500).json({ error: "Failed to delete package" });
  }
};

// GET /api/agency/bookings — tour bookings made on this agency's packages.
exports.listMyTourBookings = async (req, res) => {
  try {
    const bookings = await TourBooking.find({ agencyId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      bookings: bookings.map((b) => ({
        _id: b._id,
        guest: b.guestName || b.email || "Traveller",
        email: b.email,
        phone: b.phone,
        packageTitle: b.packageTitle,
        city: b.city,
        departureDate: b.departureDate,
        seats: b.seats,
        amount: b.amount,
        status: b.status,
        paymentStatus: b.paymentStatus || "Pending",
        ref: b.ref,
        bookedOn: b.createdAt,
      })),
    });
  } catch (err) {
    console.error("listMyTourBookings error:", err.message);
    res.status(500).json({ error: "Failed to load bookings" });
  }
};
