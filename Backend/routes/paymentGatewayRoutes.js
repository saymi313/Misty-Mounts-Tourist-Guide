const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const Booking = require("../UserBackend/models/booking");
const TourBooking = require("../UserBackend/models/tourBooking");
const { createNotification } = require("../UserBackend/controllers/notificationController");
const gateway = require("../utils/paymentGateway");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const modelFor = (type) => (type === "tour" ? TourBooking : Booking);

// GET /api/pay/config — lets the frontend choose gateway checkout vs manual flow.
router.get("/config", (req, res) => res.json({ enabled: gateway.enabled, provider: gateway.provider }));

// POST /api/pay/checkout — start a hosted-checkout session for one of the
// caller's pending bookings. Returns { url } to redirect the traveller to.
router.post("/checkout", authenticate, async (req, res) => {
  try {
    if (!gateway.enabled) return res.status(503).json({ error: "Online payment isn't set up yet." });
    const { type, ref } = req.body || {};
    if (!ref || !["tour", "hotel"].includes(type)) return res.status(400).json({ error: "type and ref are required" });

    const booking = await modelFor(type).findOne({ ref, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.paymentStatus === "Approved") return res.status(400).json({ error: "This booking is already paid" });

    const { url } = await gateway.createCheckout({
      amount: booking.amount,
      currency: "PKR",
      orderRef: ref,
      customerEmail: booking.email || "",
      successUrl: `${CLIENT_URL}/bookings?paid=1`,
      cancelUrl: `${CLIENT_URL}/bookings?canceled=1`,
      metadata: { type },
    });
    res.json({ url });
  } catch (err) {
    console.error("pay checkout error:", err.message);
    res.status(500).json({ error: "Couldn't start payment. Please try again." });
  }
});

// POST /api/pay/webhook — gateway calls this when a payment settles. Verifies the
// signature, then marks the booking paid (funds now held in escrow).
router.post("/webhook", async (req, res) => {
  try {
    if (!gateway.enabled) return res.status(404).json({ error: "not found" });
    const signature = req.headers["x-signature"] || req.headers["x-safepay-signature"] || req.headers["x-webhook-signature"];
    const raw = req.rawBody || JSON.stringify(req.body || {});
    if (!gateway.verifySignature(raw, signature)) return res.status(401).json({ error: "invalid signature" });

    const { ref, success } = gateway.parseWebhook(req.body || {});
    if (!ref) return res.status(400).json({ error: "no reference" });
    if (!success) return res.json({ ok: true }); // ignore non-success events

    // The ref belongs to exactly one collection.
    let booking = await TourBooking.findOne({ ref });
    let type = "tour";
    if (!booking) { booking = await Booking.findOne({ ref }); type = "hotel"; }
    if (!booking) return res.json({ ok: true });

    if (booking.paymentStatus !== "Approved") {
      booking.paymentStatus = "Approved";
      booking.status = "Upcoming";
      await booking.save();
      createNotification(booking.userId, {
        type: "booking",
        title: "Payment received",
        body: `Your ${type === "tour" ? "tour" : "stay"} booking ${ref} is confirmed. Have a great trip!`,
        link: "/bookings",
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("pay webhook error:", err.message);
    res.status(500).json({ error: "webhook failed" });
  }
});

module.exports = router;
