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
  agencyName: u.agencyName || "",
  isApproved: u.isApproved !== false,
  idDocument: u.idDocument || "",
  verificationStatus: u.verificationStatus || "unverified",
  verifiedAt: u.verifiedAt || null,
  referralCode: u.referralCode || "",
  referralCount: u.referralCount || 0,
  referralCredits: u.referralCredits || 0,
  savedSpots: u.savedSpots || [],
  memberSince: u.createdAt,
});

// Ensure a user has a referral code (backfills accounts created before referrals).
const ensureReferralCode = async (user) => {
  if (user.referralCode) return user;
  for (let i = 0; i < 6; i++) {
    const code = "MM" + Math.random().toString(36).slice(2, 8).toUpperCase();
    if (!(await User.exists({ referralCode: code }))) { user.referralCode = code; break; }
  }
  if (!user.referralCode) user.referralCode = "MM" + Date.now().toString(36).toUpperCase();
  await user.save();
  return user;
};

// GET /api/user/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    await ensureReferralCode(user);
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
      "languages", "specialties", "serviceAreas", "experience", "hotelName", "agencyName",
      "idDocument",
    ];
    const updates = {};
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];

    // Submitting an ID document moves the account into KYC review (a user can
    // never set 'verified' themselves — only an admin can via /users/:id/verify).
    if (updates.idDocument) updates.verificationStatus = "pending";

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
