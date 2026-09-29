const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const Booking = require("../UserBackend/models/booking");
const TourBooking = require("../UserBackend/models/tourBooking");
const { createNotification } = require("../UserBackend/controllers/notificationController");
const gateway = require("../utils/paymentGateway");
const Trip = require("../models/TripRequest");
const { paymentMatches } = require("../utils/tripCommerce");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const modelFor = (type) => (type === "tour" ? TourBooking : Booking);
const serverBase = (req) => process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;

// Settlement only accepts authenticated evidence matching the server price.
async function settle(ref, evidence) {
  const trip = await Trip.findOne({ ref });
  if (trip) {
    if (!paymentMatches({ amount: trip.quote?.total }, evidence)) return null;
    if (trip.paymentReference === evidence.txnId && trip.paidAt) return trip;
    return Trip.findOneAndUpdate({ _id: trip._id, status: "accepted", __v: trip.__v, "quote.expiresAt": { $gt: new Date() } }, {
      $set: { status: "paid", paidAt: new Date(), paymentReference: evidence.txnId, paymentProvider: gateway.provider },
      $inc: { __v: 1 }, $push: { history: { action: "gateway-payment", actor: "gateway", at: new Date() } },
    }, { new: true });
  }
  let Model = TourBooking;
  let booking = await Model.findOne({ ref });
  if (!booking) { Model = Booking; booking = await Model.findOne({ ref }); }
  if (!booking || !paymentMatches(booking, evidence)) return null;
  if (booking.paymentStatus === "Approved") return booking.gatewayTxnId === evidence.txnId ? booking : null;
  const updated = await Model.findOneAndUpdate({ _id: booking._id, paymentStatus: "Pending", status: "Upcoming" }, {
    $set: { paymentStatus: "Approved", escrowStatus: "Held", heldAt: new Date(), provider: gateway.provider, gatewayTxnId: evidence.txnId },
  }, { new: true });
  if (updated) await createNotification(updated.userId, {
    type: "booking", title: "Payment verified", body: `Payment for booking ${ref} has been verified.`, link: "/bookings",
  });
  return updated;
}

// GET /api/pay/config — lets the frontend choose gateway checkout vs manual flow.
router.get("/config", (req, res) => res.json({ enabled: gateway.enabled, provider: gateway.provider, redirect: gateway.isRedirect }));

// POST /api/pay/checkout — start checkout for one of the caller's pending bookings.
// Returns { url } (redirect) or { form: { action, fields } } (auto-submit POST).
router.post("/checkout", authenticate, async (req, res) => {
  try {
    if (!gateway.enabled) return res.status(503).json({ error: "Online payment isn't set up yet." });
    const { type, ref } = req.body || {};
    if (typeof ref !== 'string' || !ref || ref.length > 100 || !["tour", "hotel", "trip"].includes(type)) return res.status(400).json({ error: "type and ref are required" });

    const booking = await (type === "trip" ? Trip : modelFor(type)).findOne({ ref, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (type === "trip" ? booking.status !== "accepted" || new Date(booking.quote.expiresAt) <= new Date() : booking.paymentStatus !== "Pending" || booking.status !== "Upcoming") return res.status(409).json({ error: "This booking is not payable. Refresh its status or request a new quote." });

    // Redirect providers settle server-side via /callback; generic providers use
    // the client redirect + async webhook.
    const successUrl = gateway.isRedirect ? `${serverBase(req)}/api/pay/callback` : `${CLIENT_URL}/${type === "trip" ? "trip-requests" : "bookings"}?payment=pending`;
    const result = await gateway.createCheckout({
      amount: type === "trip" ? booking.quote.total : booking.amount,
      currency: "PKR",
      orderRef: ref,
      customerEmail: booking.email || "",
      successUrl,
      cancelUrl: `${CLIENT_URL}/${type === "trip" ? "trip-requests" : "bookings"}?canceled=1`,
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
    const evidence = gateway.verifyReturn(params);
    const paid = evidence.ref && evidence.valid && evidence.success && await settle(evidence.ref, evidence);
    const destination = typeof evidence.ref === 'string' && evidence.ref.startsWith('TR-') ? 'trip-requests' : 'bookings';
    return res.redirect(`${CLIENT_URL}/${destination}?payment=${paid ? "verified" : "pending"}`);
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
    const raw = req.rawBody;
    if (!gateway.verifySignature(raw, signature)) return res.status(401).json({ error: "invalid signature" });

    const evidence = gateway.parseWebhook(req.body || {});
    const { ref, success } = evidence;
    if (typeof ref !== "string" || !ref || ref.length > 100) return res.status(400).json({ error: "invalid reference" });
    if (!success) return res.json({ ok: true }); // ignore non-success events
    if (!await settle(ref, evidence)) return res.status(409).json({ error: "Payment requires reconciliation: amount, currency, reference or booking state did not match." });
    res.json({ ok: true });
  } catch (err) {
    console.error("pay webhook error:", err.message);
    res.status(500).json({ error: "webhook failed" });
  }
});

module.exports = router;
