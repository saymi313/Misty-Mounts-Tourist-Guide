const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const PushSubscription = require("../UserBackend/models/pushSubscription");
const { publicKey, enabled, sendPushToUser } = require("../utils/webpush");
const { cleanSubscription, validEndpoint } = require('../utils/pushValidation');
const rateLimit = require('express-rate-limit');
router.use(rateLimit({ ...require('../utils/rateLimitStore')('push'), windowMs: 60000, limit: 20, standardHeaders: true, legacyHeaders: false }));

// The VAPID public key the browser needs to subscribe (null when push is off).
router.get("/public-key", (req, res) => res.json({ key: publicKey, enabled }));

// Save (or refresh) a browser push subscription for the signed-in user.
router.post("/subscribe", authenticate, async (req, res) => {
  try {
    const sub = cleanSubscription(req.body?.subscription);
    if (!sub) return res.status(400).json({ error: "invalid subscription" });
    await PushSubscription.findOneAndUpdate(
      { endpoint: sub.endpoint, userId: req.user.id },
      { userId: req.user.id, endpoint: sub.endpoint, subscription: sub },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Subscription belongs to another account. Reset browser notifications first.' });
    console.error("push subscribe error:", err.message);
    res.status(500).json({ error: "subscribe failed" });
  }
});

router.post("/unsubscribe", authenticate, async (req, res) => {
  try {
    const endpoint = req.body && req.body.endpoint;
    if (!validEndpoint(endpoint)) return res.status(400).json({ error: 'Invalid endpoint' });
    await PushSubscription.deleteOne({ endpoint, userId: req.user.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "unsubscribe failed" });
  }
});

// Send a test push to the caller (handy for verifying setup).
router.post("/test", authenticate, async (req, res) => {
  await sendPushToUser(req.user.id, {
    title: "Misty Mounts",
    body: "Push notifications are on 🎉",
    link: "/notifications",
  });
  res.json({ ok: true, enabled });
});

module.exports = router;
