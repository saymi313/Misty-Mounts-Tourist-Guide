const crypto = require("crypto");

/**
 * Provider-agnostic payment gateway (Safepay / PayFast shaped). Escrow model:
 * the traveller pays the gateway → we mark the booking paid (funds held) → the
 * provider is paid out after the trip via the existing payout flow.
 *
 * DISABLED until env keys are set, so the app keeps using the manual
 * proof-upload flow with zero breakage. To go live, set in Backend/.env:
 *   PAYMENT_PROVIDER=safepay
 *   PAYMENT_API_KEY=...            (from your gateway sandbox dashboard)
 *   PAYMENT_WEBHOOK_SECRET=...     (to verify webhook signatures)
 *   PAYMENT_CREATE_URL=...         (the gateway's "create session/order" endpoint)
 *   PAYMENT_CHECKOUT_URL=...       (optional: hosted-checkout base if it returns a token)
 */
const PROVIDER = process.env.PAYMENT_PROVIDER || "safepay";
const API_KEY = process.env.PAYMENT_API_KEY || "";
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || "";
const CREATE_URL = process.env.PAYMENT_CREATE_URL || "";
const CHECKOUT_URL = process.env.PAYMENT_CHECKOUT_URL || "";

const enabled = Boolean(API_KEY && CREATE_URL);

/**
 * Create a hosted-checkout session for one booking.
 * @returns {Promise<{url: string, sessionId?: string}>}
 */
async function createCheckout({ amount, currency = "PKR", orderRef, customerEmail, successUrl, cancelUrl, metadata = {} }) {
  if (!enabled) throw new Error("payment gateway not configured");
  const res = await fetch(CREATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      amount, currency, reference: orderRef,
      customer_email: customerEmail,
      redirect_url: successUrl, cancel_url: cancelUrl,
      metadata: { ...metadata, ref: orderRef },
    }),
  });
  if (!res.ok) throw new Error(`gateway session failed: ${res.status}`);
  const data = await res.json().catch(() => ({}));
  // Different providers return the checkout URL under different keys.
  const url =
    data.url || data.checkout_url || data?.data?.url ||
    (CHECKOUT_URL && (data.token || data?.data?.token) ? `${CHECKOUT_URL}?beacon=${data.token || data.data.token}` : "");
  if (!url) throw new Error("no checkout url in gateway response");
  return { url, sessionId: data.token || data.id || data?.data?.token };
}

/** Verify a webhook's signature against the raw request body. Fails CLOSED:
 *  with no configured secret or no signature, the webhook is rejected so forged
 *  "paid" callbacks can never mark bookings as paid. */
function verifySignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) return false; // must configure PAYMENT_WEBHOOK_SECRET to accept webhooks
  if (!signature || !rawBody) return false;
  try {
    const digest = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
    const a = Buffer.from(digest);
    const b = Buffer.from(String(signature));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Normalise a webhook payload → { ref, success }. */
function parseWebhook(body) {
  const ref = body?.data?.reference || body?.reference || body?.metadata?.ref || body?.order_id || body?.orderRef;
  const status = String(body?.data?.status || body?.status || "").toLowerCase();
  const success = ["paid", "succeeded", "success", "completed", "captured", "approved"].includes(status);
  return { ref, success, status };
}

module.exports = { enabled, provider: PROVIDER, createCheckout, verifySignature, parseWebhook };
