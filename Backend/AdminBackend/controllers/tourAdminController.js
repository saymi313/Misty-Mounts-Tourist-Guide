const TourPackage = require("../../UserBackend/models/tourPackage");
const User = require("../../LocalGuidePannel/models/User");
const { createNotification } = require("../../UserBackend/controllers/notificationController");

// GET /api/admin/tours — every tour package with its agency name (admin view).
exports.listTours = async (req, res) => {
  try {
    const pkgs = await TourPackage.find().sort({ createdAt: -1 });
    const agencyIds = [...new Set(pkgs.map((p) => String(p.agencyId)))];
    const agencies = await User.find({ _id: { $in: agencyIds } }).select("name agencyName isApproved");
    const byId = Object.fromEntries(agencies.map((a) => [String(a._id), a]));
    res.json({
      tours: pkgs.map((p) => {
        const a = byId[String(p.agencyId)];
        return {
          ...p.toObject(),
          agencyName: a ? a.agencyName || a.name : "",
          agencyApproved: a ? a.isApproved !== false : false,
        };
      }),
    });
  } catch (err) {
    console.error("admin listTours error:", err.message);
    res.status(500).json({ error: "Failed to load packages" });
  }
};

// PATCH /api/admin/tours/:id/approve — approve/unapprove a package.
exports.approveTour = async (req, res) => {
  try {
    const isApproved = "isApproved" in req.body ? !!req.body.isApproved : true;
    const pkg = await TourPackage.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    if (isApproved) {
      createNotification(pkg.agencyId, {
        type: "package",
        title: "Tour package approved",
        body: `"${pkg.title}" is now live for travellers.`,
        link: "/travel-agency/packages",
      });
    }
    res.json({ package: pkg });
  } catch (err) {
    console.error("approveTour error:", err.message);
    res.status(500).json({ error: "Failed to update package" });
  }
};

// DELETE /api/admin/tours/:id — remove a package.
exports.deleteTour = async (req, res) => {
  try {
    const pkg = await TourPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteTour error:", err.message);
    res.status(500).json({ error: "Failed to delete package" });
  }
};
