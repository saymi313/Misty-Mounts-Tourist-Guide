const TourPackage = require("../../UserBackend/models/tourPackage");
const TourBooking = require("../../UserBackend/models/tourBooking");
const User = require("../../LocalGuidePannel/models/User");
const { slugify } = require("../../utils/slug");
const { getAutoApprovePackages, getRevenueConfig } = require("../../AdminBackend/controllers/settingsController");

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

// GET /api/agency/analytics — owner-scoped insights incl. seat utilization.
exports.getAnalytics = async (req, res) => {
  try {
    const packages = await TourPackage.find({ agencyId: req.user.id });
    const bookings = await TourBooking.find({ agencyId: req.user.id });
    const { commissionPercent } = await getRevenueConfig();

    const paid = bookings.filter((b) => b.paymentStatus === "Approved" && b.status !== "Cancelled");
    const gross = paid.reduce((s, b) => s + (b.amount || 0), 0);
    const net = Math.round(gross * (1 - commissionPercent / 100));
    const held = paid.filter((b) => b.escrowStatus !== "Released").reduce((s, b) => s + (b.amount || 0), 0);
    const seatsSold = paid.reduce((s, b) => s + (b.seats || 0), 0);

    // Seat utilization across every departure.
    let seatsTotal = 0, seatsBooked = 0;
    packages.forEach((p) => (p.departures || []).forEach((d) => { seatsTotal += d.seatsTotal || 0; seatsBooked += d.seatsBooked || 0; }));
    const fillRate = seatsTotal ? Math.round((seatsBooked / seatsTotal) * 100) : 0;

    const MONTHS = 6;
    const since = new Date(); since.setDate(1); since.setHours(0, 0, 0, 0); since.setMonth(since.getMonth() - (MONTHS - 1));
    const series = [];
    for (let i = 0; i < MONTHS; i++) {
      const d = new Date(since); d.setMonth(since.getMonth() + i);
      const y = d.getFullYear(), m = d.getMonth();
      const rows = paid.filter((b) => { const c = new Date(b.createdAt); return c.getFullYear() === y && c.getMonth() === m; });
      series.push({ label: d.toLocaleString("en", { month: "short" }), revenue: rows.reduce((s, b) => s + (b.amount || 0), 0), bookings: rows.length });
    }

    const byStatus = {};
    bookings.forEach((b) => { byStatus[b.status] = (byStatus[b.status] || 0) + 1; });

    const revByPkg = {};
    paid.forEach((b) => { revByPkg[b.packageId] = (revByPkg[b.packageId] || 0) + (b.amount || 0); });
    const topPackages = packages
      .map((p) => ({ name: p.title, revenue: revByPkg[p._id] || 0 }))
      .sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const now = new Date();
    const upcomingDeps = packages.reduce((n, p) => n + (p.departures || []).filter((d) => new Date(d.date) >= now).length, 0);

    res.json({
      kpis: {
        bookings: paid.length, gross, net, held, seatsSold, fillRate,
        aov: paid.length ? Math.round(gross / paid.length) : 0,
        packages: packages.length, upcomingDeps, commissionPercent,
      },
      series, byStatus, topPackages,
    });
  } catch (err) {
    console.error("agency getAnalytics error:", err.message);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};
