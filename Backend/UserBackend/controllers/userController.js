const User = require("../../LocalGuidePannel/models/User");
const { uploadBuffer } = require("../../config/cloudinary");

/** Shape a user document for the client (never leaks the password hash). */
const publicUser = (u) => ({
  _id: u._id,
  email: u.email,
  username: u.username,
  name: u.name || u.username,
  type: u.type,
  phone: u.phone || "",
  city: u.city || "",
  bio: u.bio || "",
  avatar: u.avatar || "",
  interests: u.interests || [],
  languages: u.languages || [],
  specialties: u.specialties || [],
  serviceAreas: u.serviceAreas || [],
  experience: u.experience || "",
  hotelName: u.hotelName || "",
  savedSpots: u.savedSpots || [],
  memberSince: u.createdAt,
});

// GET /api/user/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("getMe error:", err.message);
    res.status(500).json({ error: "Failed to load profile" });
  }
};

// PUT /api/user/me
exports.updateMe = async (req, res) => {
  try {
    const allowed = [
      "name", "email", "phone", "city", "bio", "interests", "avatar",
      "languages", "specialties", "serviceAreas", "experience", "hotelName",
    ];
    const updates = {};
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];

    if (updates.email) {
      const clash = await User.findOne({ email: updates.email, _id: { $ne: req.user.id } });
      if (clash) return res.status(409).json({ error: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("updateMe error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// POST /api/user/avatar  (multipart form field: "avatar")
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const result = await uploadBuffer(req.file.buffer, "misty-mounts/avatars");
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select("-password");
    res.json({ avatar: result.secure_url, user: publicUser(user) });
  } catch (err) {
    console.error("uploadAvatar error:", err.message);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
};

// ── Saved spots ───────────────────────────────────────────────────────────────
// GET /api/user/saved
exports.getSaved = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("savedSpots");
    res.json({ savedSpots: user?.savedSpots || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to load saved spots" });
  }
};

// POST /api/user/saved/:spotId
exports.addSaved = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { savedSpots: req.params.spotId } },
      { new: true }
    ).select("savedSpots");
    res.status(201).json({ savedSpots: user.savedSpots });
  } catch (err) {
    res.status(500).json({ error: "Failed to save spot" });
  }
};

// DELETE /api/user/saved/:spotId
exports.removeSaved = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { savedSpots: req.params.spotId } },
      { new: true }
    ).select("savedSpots");
    res.json({ savedSpots: user.savedSpots });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove saved spot" });
  }
};

exports.publicUser = publicUser;
