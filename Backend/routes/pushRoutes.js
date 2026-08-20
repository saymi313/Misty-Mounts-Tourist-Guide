const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const PushSubscription = require("../UserBackend/models/pushSubscription");
const { publicKey, enabled, sendPushToUser } = require("../utils/webpush");

// The VAPID public key the browser needs to subscribe (null when push is off).
router.get("/public-key", (req, res) => res.json({ key: publicKey, enabled }));

// Save (or refresh) a browser push subscription for the signed-in user.
router.post("/subscribe", authenticate, async (req, res) => {
  try {
    const sub = req.body && req.body.subscription;
    if (!sub || !sub.endpoint) return res.status(400).json({ error: "invalid subscription" });
    await PushSubscription.findOneAndUpdate(
      { endpoint: sub.endpoint },
      { userId: req.user.id, endpoint: sub.endpoint, subscription: sub },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("push subscribe error:", err.message);
    res.status(500).json({ error: "subscribe failed" });
  }
});

router.post("/unsubscribe", authenticate, async (req, res) => {
  try {
    const endpoint = req.body && req.body.endpoint;
    if (endpoint) await PushSubscription.deleteOne({ endpoint });
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
