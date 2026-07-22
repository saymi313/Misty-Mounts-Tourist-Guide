const User = require("../../LocalGuidePannel/models/User");

/** Full user shape for the admin users screen (never leaks password/otp). */
const shape = (u) => ({
  _id: u._id,
  name: u.name || u.username,
  username: u.username,
  email: u.email,
  type: u.type,
  phone: u.phone || "",
  city: u.city || "",
  bio: u.bio || "",
  avatar: u.avatar || "",
  interests: u.interests || [],
  savedSpots: u.savedSpots || [],
  isVerified: !!u.isVerified,
  memberSince: u.createdAt,
});

// GET /api/admin/users?type=user|local%20guide
exports.listUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const users = await User.find(filter)
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 });
    res.json({ users: users.map(shape) });
  } catch (err) {
    console.error("listUsers error:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// GET /api/admin/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: shape(user) });
  } catch (err) {
    console.error("getUser error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteUser error:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
