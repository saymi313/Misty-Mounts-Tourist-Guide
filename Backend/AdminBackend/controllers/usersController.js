const User = require("../../LocalGuidePannel/models/User");
const { createNotification } = require("../../UserBackend/controllers/notificationController");

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
  agencyName: u.agencyName || "",
  isApproved: u.isApproved !== false,
  interests: u.interests || [],
  savedSpots: u.savedSpots || [],
  isVerified: !!u.isVerified,
  idDocument: u.idDocument || "",
  verificationStatus: u.verificationStatus || "unverified",
  verifiedAt: u.verifiedAt || null,
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

// PATCH /api/admin/users/:id/approve — admin approves/unapproves an account
// (used to vet travel agencies before their tours go public).
exports.approveUser = async (req, res) => {
  try {
    const isApproved = "isApproved" in req.body ? !!req.body.isApproved : true;
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved }, { new: true })
      .select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ error: "User not found" });
    if (isApproved) {
      createNotification(user._id, {
        type: "agency",
        title: "Your agency was approved",
        body: "You can now publish tour packages and take bookings on Misty Mounts.",
        link: "/travel-agency",
      });
    }
    res.json({ user: shape(user) });
  } catch (err) {
    console.error("approveUser error:", err.message);
    res.status(500).json({ error: "Failed to update approval" });
  }
};

// PATCH /api/admin/users/:id/verify — admin confirms (or rejects) a KYC submission.
exports.verifyUser = async (req, res) => {
  try {
    const verified = "verified" in req.body ? !!req.body.verified : true;
    const update = verified
      ? { verificationStatus: "verified", verifiedAt: new Date() }
      : { verificationStatus: "unverified", verifiedAt: null };
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ error: "User not found" });
    createNotification(user._id, {
      type: "system",
      title: verified ? "You're verified" : "Verification not approved",
      body: verified
        ? "Your identity has been verified. A Verified badge now appears on your profile."
        : "We couldn't verify your identity. Please re-upload a clear ID document.",
      link: "/local-guide/profile",
    });
    res.json({ user: shape(user) });
  } catch (err) {
    console.error("verifyUser error:", err.message);
    res.status(500).json({ error: "Failed to update verification" });
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
