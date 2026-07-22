const User = require("../../LocalGuidePannel/models/User");
const Feedback = require("../models/feedback");

const shapeGuide = (u, agg) => ({
  _id: u._id,
  name: u.name || u.username,
  avatar: u.avatar || "",
  city: u.city || "",
  bio: u.bio || "",
  experience: u.experience || "",
  languages: u.languages || [],
  specialties: u.specialties || [],
  serviceAreas: u.serviceAreas || [],
  rating: agg ? Math.round(agg.avg * 10) / 10 : 0,
  reviewCount: agg ? agg.count : 0,
});

const GUIDE_FIELDS = "name username avatar city bio experience languages specialties serviceAreas";

// GET /api/user/guides — public directory of local guides (with rating/reviews).
exports.listGuides = async (req, res) => {
  try {
    const guides = await User.find({ type: "local guide" }).select(GUIDE_FIELDS);
    const aggs = await Feedback.aggregate([
      { $match: { guideId: { $ne: null } } },
      { $group: { _id: "$guideId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const map = {};
    aggs.forEach((a) => { map[String(a._id)] = a; });
    res.json({ guides: guides.map((g) => shapeGuide(g, map[String(g._id)])) });
  } catch (err) {
    console.error("listGuides error:", err.message);
    res.status(500).json({ error: "Failed to load guides" });
  }
};

// GET /api/user/guides/:id — a single guide's public profile.
exports.getGuide = async (req, res) => {
  try {
    const g = await User.findOne({ _id: req.params.id, type: "local guide" }).select(GUIDE_FIELDS);
    if (!g) return res.status(404).json({ error: "Guide not found" });
    const aggs = await Feedback.aggregate([
      { $match: { guideId: g._id } },
      { $group: { _id: "$guideId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    res.json({ guide: shapeGuide(g, aggs[0]) });
  } catch (err) {
    console.error("getGuide error:", err.message);
    res.status(err.name === "CastError" ? 404 : 500).json({ error: "Failed to load guide" });
  }
};
