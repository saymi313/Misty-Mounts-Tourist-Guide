const Query = require("../../UserBackend/models/query");
const Booking = require("../../UserBackend/models/booking");
const Payout = require("../../UserBackend/models/payout");
const Accommodation = require("../models/Accommodation");
const TouristSpot = require("../models/TouristSport");

// GET /api/admin/counts — actionable badge counts for the admin sidebar.
exports.getCounts = async (req, res) => {
  try {
    const [queries, pendingPayments, pendingPayouts, pendingListings, spotAgg] = await Promise.all([
      Query.countDocuments({ isRead: false }),
      Booking.countDocuments({ paymentStatus: "Pending" }),
      Payout.countDocuments({ status: "Requested" }),
      Accommodation.countDocuments({ isApproved: false }),
      TouristSpot.aggregate([
        { $unwind: "$nearbyPlaces" },
        { $match: { "nearbyPlaces.isApproved": false } },
        { $count: "n" },
      ]),
    ]);
    res.json({
      queries,
      pendingPayments,
      pendingPayouts,
      pendingListings,
      pendingSpots: spotAgg[0]?.n || 0,
    });
  } catch (err) {
    console.error("getCounts error:", err.message);
    res.status(500).json({ error: "Failed to load counts" });
  }
};
