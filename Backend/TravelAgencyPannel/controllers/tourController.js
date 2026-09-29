const TourPackage = require("../../UserBackend/models/tourPackage");
const TourBooking = require("../../UserBackend/models/tourBooking");
const User = require("../../LocalGuidePannel/models/User");
const Admin = require("../../AdminBackend/models/Admin");
const { createNotification } = require("../../UserBackend/controllers/notificationController");

// Best-effort fan-out of a notification to every admin.
const notifyAdmins = async (data) => {
  try {
    const admins = await Admin.find().select("_id");
    admins.forEach((a) => createNotification(a._id, data));
  } catch (e) {
    console.error("notifyAdmins (tours):", e.message);
  }
};

const shapeAgency = (a) =>
  a ? { id: a._id, name: a.agencyName || a.name || "Travel Agency", avatar: a.avatar || "", city: a.city || "", bio: a.bio || "" } : null;

// GET /api/tours — public: approved + published packages from approved agencies.
exports.listTours = async (req, res) => {
  try {
    const { city, q } = req.query;
    const { page, limit, skip } = require('../../utils/pagination').pagination(req.query, 200);
    if ((city !== undefined && typeof city !== 'string') || (q !== undefined && (typeof q !== 'string' || q.length > 200))) return res.status(400).json({ error: 'Invalid search filters' });
    const filter = { isApproved: true, isPublished: true };
    if (city && city !== "all") filter.cities = city;
    if (q) filter.$or = ['title', 'summary', 'cities'].map(field => ({ [field]: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));
    let pkgs = await TourPackage.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit + 1).maxTimeMS(5000).lean();
    const hasMore = pkgs.length > limit;
    pkgs = pkgs.slice(0, limit);

    // Keep only packages whose agency account is admin-approved.
    const agencyIds = [...new Set(pkgs.map((p) => String(p.agencyId)))];
    const agencies = await User.find({ _id: { $in: agencyIds }, isApproved: { $ne: false } })
      .select("name agencyName avatar city bio");
    const okAgency = new Map(agencies.map((a) => [String(a._id), a]));
    pkgs = pkgs.filter((p) => okAgency.has(String(p.agencyId)));

    res.json({
      pagination: { page, limit, hasMore },
      tours: pkgs.map((p) => ({ ...p, agency: shapeAgency(okAgency.get(String(p.agencyId))) })),
    });
  } catch (err) {
    console.error("listTours error:", err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : "Failed to load tours" });
  }
};

// GET /api/tours/:id — public: a single approved package.
exports.getTour = async (req, res) => {
  try {
    const p = await TourPackage.findById(req.params.id);
    if (!p || !p.isApproved || !p.isPublished) return res.status(404).json({ error: "Tour not found" });
    const agency = await User.findById(p.agencyId).select("name agencyName avatar city bio isApproved");
    if (!agency || agency.isApproved === false) return res.status(404).json({ error: "Tour not found" });
    res.json({ tour: { ...p.toObject(), agency: shapeAgency(agency) } });
  } catch (err) {
    console.error("getTour error:", err.message);
    res.status(500).json({ error: "Failed to load tour" });
  }
};

// POST /api/tours/book — authenticated traveller books seats on a departure.
exports.bookTour = async (req, res) => {
  try {
    const { booking, pkg } = await require('../../utils/tourReservation').reserveTour(req.user.id, req.body);
    const n = booking.seats, ref = booking.ref;

    createNotification(req.user.id, {
      type: "booking",
      title: "Tour booking submitted",
      body: `${pkg.title} — pending verification`,
      link: "/bookings",
    });
    notifyAdmins({
      type: "booking",
      title: "New tour payment to verify",
      body: `${pkg.title} · ${n} seat(s)`,
      link: "/admin/revenue",
    });
    createNotification(pkg.agencyId, {
      type: "booking",
      title: "New tour booking",
      body: `${pkg.title} · ${n} seat(s)`,
      link: "/travel-agency/bookings",
    });

    res.status(201).json({ success: true, bookingId: ref, booking });
  } catch (err) {
    console.error("bookTour error:", err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : "Failed to book this tour" });
  }
};

// GET /api/tours/my-bookings — the signed-in traveller's tour bookings.
exports.listMyTourBookings = async (req, res) => {
  try {
    const bookings = await TourBooking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    console.error("listMyTourBookings error:", err.message);
    res.status(500).json({ error: "Failed to load your tour bookings" });
  }
};
