const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const Booking = require("../UserBackend/models/booking");
const TourBooking = require("../UserBackend/models/tourBooking");
const { createNotification } = require("../UserBackend/controllers/notificationController");
const gateway = require("../utils/paymentGateway");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const modelFor = (type) => (type === "tour" ? TourBooking : Booking);
const serverBase = (req) => process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;

// Mark a booking paid + funds Held in escrow. Idempotent (safe to call twice).
async function settle(ref, txnId) {
  let booking = await TourBooking.findOne({ ref });
  let type = "tour";
  if (!booking) { booking = await Booking.findOne({ ref }); type = "hotel"; }
  if (!booking) return null;
  if (booking.paymentStatus !== "Approved") {
    booking.paymentStatus = "Approved";
    booking.status = "Upcoming";
    booking.escrowStatus = "Held";
    booking.heldAt = new Date();
    booking.provider = gateway.provider;
    if (txnId) booking.gatewayTxnId = txnId;
    await booking.save();
    createNotification(booking.userId, {
      type: "booking",
      title: "Payment received",
      body: `Your ${type === "tour" ? "tour" : "stay"} booking ${ref} is confirmed. Your money is held safely in escrow until your trip.`,
      link: "/bookings",
    });
    // Notify the partner.
    if (type === "tour" && booking.agencyId) {
      createNotification(booking.agencyId, {
        type: "booking", title: "New confirmed tour booking",
        body: `${booking.guestName || "A traveller"} paid for ${booking.seats} seat(s) on ${booking.packageTitle}.`,
        link: "/travel-agency/bookings",
      });
    }
  }
  return booking;
}

// GET /api/pay/config — lets the frontend choose gateway checkout vs manual flow.
router.get("/config", (req, res) => res.json({ enabled: gateway.enabled, provider: gateway.provider, redirect: gateway.isRedirect }));

// POST /api/pay/checkout — start checkout for one of the caller's pending bookings.
// Returns { url } (redirect) or { form: { action, fields } } (auto-submit POST).
router.post("/checkout", authenticate, async (req, res) => {
  try {
    if (!gateway.enabled) return res.status(503).json({ error: "Online payment isn't set up yet." });
    const { type, ref } = req.body || {};
    if (!ref || !["tour", "hotel"].includes(type)) return res.status(400).json({ error: "type and ref are required" });

    const booking = await modelFor(type).findOne({ ref, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.paymentStatus === "Approved") return res.status(400).json({ error: "This booking is already paid" });

    // Redirect providers settle server-side via /callback; generic providers use
    // the client redirect + async webhook.
    const successUrl = gateway.isRedirect ? `${serverBase(req)}/api/pay/callback` : `${CLIENT_URL}/bookings?paid=1`;
    const result = await gateway.createCheckout({
      amount: booking.amount,
      currency: "PKR",
      orderRef: ref,
      customerEmail: booking.email || "",
      successUrl,
      cancelUrl: `${CLIENT_URL}/bookings?canceled=1`,
      metadata: { type },
    });
    res.json(result); // { url } or { form }
  } catch (err) {
    console.error("pay checkout error:", err.message);
    res.status(500).json({ error: "Couldn't start payment. Please try again." });
  }
});

// ALL /api/pay/callback — browser return from a redirect provider (JazzCash/
// Easypaisa). Verifies, settles, then bounces the traveller back to /bookings.
router.all("/callback", async (req, res) => {
  try {
    if (!gateway.enabled || !gateway.isRedirect) return res.redirect(`${CLIENT_URL}/bookings`);
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { ref, success, txnId, valid } = gateway.verifyReturn(params);
    if (ref && valid && success) await settle(ref, txnId);
    return res.redirect(`${CLIENT_URL}/bookings?${success && valid ? "paid=1" : "canceled=1"}`);
  } catch (err) {
    console.error("pay callback error:", err.message);
    return res.redirect(`${CLIENT_URL}/bookings?canceled=1`);
  }
});

// POST /api/pay/webhook — server-to-server settlement for the generic JSON
// provider. Verifies the HMAC signature, then marks the booking paid + held.
router.post("/webhook", async (req, res) => {
  try {
    if (!gateway.enabled) return res.status(404).json({ error: "not found" });
    const signature = req.headers["x-signature"] || req.headers["x-safepay-signature"] || req.headers["x-webhook-signature"];
    const raw = req.rawBody || JSON.stringify(req.body || {});
    if (!gateway.verifySignature(raw, signature)) return res.status(401).json({ error: "invalid signature" });

    const { ref, success, txnId } = gateway.parseWebhook(req.body || {});
    if (!ref) return res.status(400).json({ error: "no reference" });
    if (!success) return res.json({ ok: true }); // ignore non-success events
    await settle(ref, txnId);
    res.json({ ok: true });
  } catch (err) {
    console.error("pay webhook error:", err.message);
    res.status(500).json({ error: "webhook failed" });
  }
});

module.exports = router;
