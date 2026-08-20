const Query = require("../../UserBackend/models/query");
const Booking = require("../../UserBackend/models/booking");
const Payout = require("../../UserBackend/models/payout");
const Accommodation = require("../models/Accommodation");
const TouristSpot = require("../models/TouristSport");
const TourPackage = require("../../UserBackend/models/tourPackage");
const TourBooking = require("../../UserBackend/models/tourBooking");
const User = require("../../LocalGuidePannel/models/User");
const Settings = require("../models/Settings");
const Waitlist = require("../../UserBackend/models/waitlist");

// GET /api/admin/counts — actionable badge counts for the admin sidebar.
exports.getCounts = async (req, res) => {
  try {
    const [queries, pendingPayments, pendingPayouts, pendingListings, spotAgg, pendingPackages, pendingAgencies, pendingTourPayments] = await Promise.all([
      Query.countDocuments({ isRead: false }),
      Booking.countDocuments({ paymentStatus: "Pending" }),
      Payout.countDocuments({ status: "Requested" }),
      Accommodation.countDocuments({ isApproved: false }),
      TouristSpot.aggregate([
        { $unwind: "$nearbyPlaces" },
        { $match: { "nearbyPlaces.isApproved": false } },
        { $count: "n" },
      ]),
      TourPackage.countDocuments({ isApproved: false }),
      User.countDocuments({ type: "travel agency", isApproved: false }),
      TourBooking.countDocuments({ paymentStatus: "Pending" }),
    ]);
    res.json({
      queries,
      pendingPayments: pendingPayments + pendingTourPayments,
      pendingPayouts,
      pendingListings,
      pendingSpots: spotAgg[0]?.n || 0,
      pendingPackages,
      pendingAgencies,
    });
  } catch (err) {
    console.error("getCounts error:", err.message);
    res.status(500).json({ error: "Failed to load counts" });
  }
};

// GET /api/admin/analytics — trends & breakdowns for the admin analytics dashboard.
exports.getAnalytics = async (req, res) => {
  try {
    const MONTHS = 6;
    const since = new Date();
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    since.setMonth(since.getMonth() - (MONTHS - 1));

    const monthAgg = (Model) =>
      Model.aggregate([
        { $match: { paymentStatus: "Approved", createdAt: { $gte: since } } },
        { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, revenue: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]);
    const totalRev = (Model) =>
      Model.aggregate([{ $match: { paymentStatus: "Approved" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
    const statusAgg = (Model) => Model.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
    const cityAgg = (Model) =>
      Model.aggregate([
        { $match: { paymentStatus: "Approved" } },
        { $group: { _id: "$city", n: { $sum: 1 } } },
        { $sort: { n: -1 } },
        { $limit: 8 },
      ]);
    // Approved bookings per customer (for the repeat-booking rate).
    const custAgg = (Model) =>
      Model.aggregate([
        { $match: { paymentStatus: "Approved" } },
        { $group: { _id: "$userId", n: { $sum: 1 } } },
      ]);
    const isProvider = { $in: ["$type", ["local guide", "hotel", "travel agency"]] };

    const [
      hotelMonthly, tourMonthly, hotelRev, tourRev,
      hotelStatus, tourStatus, hotelCity, tourCity,
      usersByTypeAgg, spotsAgg, hotelBookings, tourBookings,
      hotelCust, tourCust, signupAgg, settings, waitlistCount,
    ] = await Promise.all([
      monthAgg(Booking), monthAgg(TourBooking), totalRev(Booking), totalRev(TourBooking),
      statusAgg(Booking), statusAgg(TourBooking), cityAgg(Booking), cityAgg(TourBooking),
      User.aggregate([{ $group: { _id: "$type", n: { $sum: 1 } } }]),
      TouristSpot.aggregate([{ $unwind: "$nearbyPlaces" }, { $count: "n" }]),
      Booking.countDocuments({ paymentStatus: "Approved" }),
      TourBooking.countDocuments({ paymentStatus: "Approved" }),
      custAgg(Booking), custAgg(TourBooking),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" }, provider: { $cond: [isProvider, true, false] } }, n: { $sum: 1 } } },
      ]),
      Settings.findOne().lean(),
      Waitlist.countDocuments(),
    ]);

    // Monthly series (last 6 months, zero-filled).
    const series = [];
    for (let i = 0; i < MONTHS; i++) {
      const d = new Date(since);
      d.setMonth(since.getMonth() + i);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      const find = (agg) => agg.find((a) => a._id.y === y && a._id.m === m) || { revenue: 0, count: 0 };
      const h = find(hotelMonthly), t = find(tourMonthly);
      series.push({
        label: d.toLocaleString("en", { month: "short" }),
        revenue: h.revenue + t.revenue,
        bookings: h.count + t.count,
        hotelRevenue: h.revenue,
        tourRevenue: t.revenue,
      });
    }

    // Merge city counts across both booking types.
    const cityMap = {};
    [...hotelCity, ...tourCity].forEach((c) => { if (c._id) cityMap[c._id] = (cityMap[c._id] || 0) + c.n; });
    const topCities = Object.entries(cityMap).map(([city, n]) => ({ city, n })).sort((a, b) => b.n - a.n).slice(0, 6);

    // Merge booking status.
    const bookingsByStatus = {};
    [...hotelStatus, ...tourStatus].forEach((s) => { if (s._id) bookingsByStatus[s._id] = (bookingsByStatus[s._id] || 0) + s.n; });

    const usersByType = {};
    usersByTypeAgg.forEach((u) => { usersByType[u._id || "user"] = u.n; });

    // Monthly signups split into demand (travellers) vs supply (providers).
    const signups = [];
    for (let i = 0; i < MONTHS; i++) {
      const d = new Date(since);
      d.setMonth(since.getMonth() + i);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      const rows = signupAgg.filter((a) => a._id.y === y && a._id.m === m);
      const travellers = rows.filter((r) => !r._id.provider).reduce((s, r) => s + r.n, 0);
      const providers = rows.filter((r) => r._id.provider).reduce((s, r) => s + r.n, 0);
      signups.push({ label: d.toLocaleString("en", { month: "short" }), travellers, providers });
    }

    // Marketplace KPIs.
    const bookings = hotelBookings + tourBookings;
    const gmv = (hotelRev[0]?.total || 0) + (tourRev[0]?.total || 0);
    const takeRatePct = settings?.commissionPercent ?? 15;
    const netRevenue = Math.round((gmv * takeRatePct) / 100);
    const aov = bookings ? Math.round(gmv / bookings) : 0;

    // Repeat-booking rate across both booking types.
    const perCustomer = {};
    [...hotelCust, ...tourCust].forEach((c) => { if (c._id) perCustomer[String(c._id)] = (perCustomer[String(c._id)] || 0) + c.n; });
    const customers = Object.keys(perCustomer).length;
    const repeatCustomers = Object.values(perCustomer).filter((n) => n >= 2).length;
    const repeatRate = customers ? Math.round((repeatCustomers / customers) * 100) : 0;

    res.json({
      totals: {
        revenue: gmv,
        bookings,
        users: usersByTypeAgg.reduce((s, u) => s + u.n, 0),
        spots: spotsAgg[0]?.n || 0,
      },
      kpis: { gmv, takeRatePct, netRevenue, aov, customers, repeatCustomers, repeatRate, waitlist: waitlistCount || 0 },
      revenueSplit: { hotels: hotelRev[0]?.total || 0, tours: tourRev[0]?.total || 0 },
      series,
      signups,
      topCities,
      bookingsByStatus,
      usersByType,
    });
  } catch (err) {
    console.error("getAnalytics error:", err.message);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};
