const Accommodation = require("../../AdminBackend/models/Accommodation");
const Booking = require("../../UserBackend/models/booking");
const { uniqueAccSlug } = require("../../AdminBackend/controllers/accommodationController");
const { getAutoApproveListings, getRevenueConfig } = require("../../AdminBackend/controllers/settingsController");

// Fields a hotel owner may set on their own listing.
const OWNER_FIELDS = [
  "name", "type", "location", "city", "description", "picture",
  "price", "amenities", "tags", "isAvailable", "specialOffer",
  "bookingMode", "blackoutDates",
];

// GET /api/hotel/accommodations — the signed-in hotel's own listings.
exports.listMyAccommodations = async (req, res) => {
  try {
    const items = await Accommodation.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("listMyAccommodations error:", err.message);
    res.status(500).json({ error: "Failed to load your listings" });
  }
};

// POST /api/hotel/accommodations — create a listing owned by this hotel.
exports.createMyAccommodation = async (req, res) => {
  try {
    if (!req.body.name || req.body.price == null) {
      return res.status(400).json({ error: "name and price are required" });
    }
    const doc = { _id: await uniqueAccSlug(req.body.name), ownerId: req.user.id };
    for (const f of OWNER_FIELDS) if (f in req.body) doc[f] = req.body[f];
    if (doc.type !== "food") doc.type = "hotel";
    // Guide-style approval gate: pending unless the admin enabled auto-approval.
    doc.isApproved = await getAutoApproveListings();
    const accommodation = await Accommodation.create(doc);
    res.status(201).json({ message: "Listing created", accommodation });
  } catch (err) {
    console.error("createMyAccommodation error:", err.message);
    res.status(500).json({ error: "Failed to create listing" });
  }
};

// PUT /api/hotel/accommodations/:id — update own listing (can't self-approve).
exports.updateMyAccommodation = async (req, res) => {
  try {
    const doc = await Accommodation.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!doc) return res.status(404).json({ error: "Listing not found" });
    for (const f of OWNER_FIELDS) if (f in req.body) doc[f] = req.body[f];
    if (doc.type !== "food") doc.type = "hotel";
    await doc.save();
    res.json({ message: "Listing updated", accommodation: doc });
  } catch (err) {
    console.error("updateMyAccommodation error:", err.message);
    res.status(500).json({ error: "Failed to update listing" });
  }
};

// DELETE /api/hotel/accommodations/:id — delete own listing.
exports.deleteMyAccommodation = async (req, res) => {
  try {
    const doc = await Accommodation.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
    if (!doc) return res.status(404).json({ error: "Listing not found" });
    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("deleteMyAccommodation error:", err.message);
    res.status(500).json({ error: "Failed to delete listing" });
  }
};

// GET /api/hotel/bookings — bookings made for this hotel's listings.
exports.listMyBookings = async (req, res) => {
  try {
    const ids = (await Accommodation.find({ ownerId: req.user.id }).select("_id")).map((a) => a._id);
    const bookings = await Booking.find({ accId: { $in: ids } }).sort({ createdAt: -1 });
    res.json({
      bookings: bookings.map((b) => ({
        _id: b._id,
        guest: b.guestName || b.email || "Guest",
        hotel: b.hotel,
        city: b.city,
        checkIn: b.checkIn,
        nights: b.nights,
        guests: b.guests,
        amount: b.amount,
        status: b.status,
        paymentStatus: b.paymentStatus || "Approved",
        ref: b.ref,
        bookedOn: b.createdAt,
      })),
    });
  } catch (err) {
    console.error("listMyBookings error:", err.message);
    res.status(500).json({ error: "Failed to load bookings" });
  }
};

// GET /api/hotel/analytics — owner-scoped insights (real data, no placeholders).
exports.getAnalytics = async (req, res) => {
  try {
    const listings = await Accommodation.find({ ownerId: req.user.id }).select("_id name");
    const ids = listings.map((l) => l._id);
    const bookings = await Booking.find({ accId: { $in: ids } });
    const { commissionPercent } = await getRevenueConfig();

    const paid = bookings.filter((b) => b.paymentStatus === "Approved" && b.status !== "Cancelled");
    const gross = paid.reduce((s, b) => s + (b.amount || 0), 0);
    const net = Math.round(gross * (1 - commissionPercent / 100));
    const held = paid
      .filter((b) => b.escrowStatus !== "Released")
      .reduce((s, b) => s + (b.amount || 0), 0);

    // Last-6-months revenue + bookings series.
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

    const revByAcc = {};
    paid.forEach((b) => { revByAcc[b.accId] = (revByAcc[b.accId] || 0) + (b.amount || 0); });
    const topListings = listings
      .map((l) => ({ name: l.name, revenue: revByAcc[l._id] || 0 }))
      .sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    res.json({
      kpis: {
        bookings: paid.length, gross, net, held,
        aov: paid.length ? Math.round(gross / paid.length) : 0,
        upcoming: bookings.filter((b) => b.status === "Upcoming").length,
        pending: bookings.filter((b) => b.paymentStatus === "Pending").length,
        listings: listings.length, commissionPercent,
      },
      series, byStatus, topListings,
    });
  } catch (err) {
    console.error("hotel getAnalytics error:", err.message);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};
