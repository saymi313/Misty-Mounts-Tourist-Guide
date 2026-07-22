const Settings = require("../models/Settings");

const shape = (s) => ({ autoApproveSpots: !!s.autoApproveSpots });

// GET /api/admin/settings — read the global platform settings.
exports.getSettings = async (req, res) => {
  try {
    const s = await Settings.getGlobal();
    res.json({ settings: shape(s) });
  } catch (err) {
    console.error("getSettings error:", err.message);
    res.status(500).json({ error: "Failed to load settings" });
  }
};

// PATCH /api/admin/settings — update the global platform settings.
exports.updateSettings = async (req, res) => {
  try {
    const s = await Settings.getGlobal();
    if ("autoApproveSpots" in req.body) s.autoApproveSpots = !!req.body.autoApproveSpots;
    await s.save();
    res.json({ settings: shape(s) });
  } catch (err) {
    console.error("updateSettings error:", err.message);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

// Helper for other controllers (e.g. places) to read the auto-approve flag.
exports.getAutoApprove = async () => {
  try {
    const s = await Settings.getGlobal();
    return !!s.autoApproveSpots;
  } catch {
    return false;
  }
};
