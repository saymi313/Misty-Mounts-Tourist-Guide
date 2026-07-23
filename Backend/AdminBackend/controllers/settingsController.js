const Settings = require("../models/Settings");

const shape = (s) => ({
  autoApproveSpots: !!s.autoApproveSpots,
  autoApproveListings: !!s.autoApproveListings,
  commissionPercent: s.commissionPercent ?? 15,
  minPayoutThreshold: s.minPayoutThreshold ?? 5000,
  paymentAccounts: s.paymentAccounts || [],
});

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
    if ("autoApproveListings" in req.body) s.autoApproveListings = !!req.body.autoApproveListings;
    if ("commissionPercent" in req.body) {
      s.commissionPercent = Math.max(0, Math.min(100, Number(req.body.commissionPercent) || 0));
    }
    if ("minPayoutThreshold" in req.body) {
      s.minPayoutThreshold = Math.max(0, Number(req.body.minPayoutThreshold) || 0);
    }
    if (Array.isArray(req.body.paymentAccounts)) s.paymentAccounts = req.body.paymentAccounts;
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

// Helper for the hotel panel to read the listings auto-approve flag.
exports.getAutoApproveListings = async () => {
  try {
    const s = await Settings.getGlobal();
    return !!s.autoApproveListings;
  } catch {
    return false;
  }
};

// GET /api/payment/accounts — public: the accounts travellers pay into at checkout.
exports.getPublicPaymentInfo = async (req, res) => {
  try {
    const s = await Settings.getGlobal();
    res.json({ paymentAccounts: s.paymentAccounts || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to load payment info" });
  }
};

exports.getCommissionPercent = async () => {
  try {
    const s = await Settings.getGlobal();
    return s.commissionPercent ?? 15;
  } catch {
    return 15;
  }
};

// { commissionPercent, minPayoutThreshold } for the payout balance logic.
exports.getRevenueConfig = async () => {
  try {
    const s = await Settings.getGlobal();
    return { commissionPercent: s.commissionPercent ?? 15, minPayoutThreshold: s.minPayoutThreshold ?? 5000 };
  } catch {
    return { commissionPercent: 15, minPayoutThreshold: 5000 };
  }
};
