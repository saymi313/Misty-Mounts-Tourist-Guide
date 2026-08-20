const express = require("express");
const router = express.Router();
const Waitlist = require("../UserBackend/models/waitlist");

// POST /api/waitlist — public email capture (idempotent by email).
router.post("/", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email." });
    }
    await Waitlist.findOneAndUpdate(
      { email },
      { $setOnInsert: { email, source: String(req.body.source || "").slice(0, 60) } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("waitlist error:", err.message);
    res.status(500).json({ error: "Couldn't join the waitlist. Please try again." });
  }
});

module.exports = router;
