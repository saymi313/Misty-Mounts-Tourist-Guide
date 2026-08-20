const crypto = require("crypto");

/**
 * Multi-provider payment gateway for Misty Mounts.
 *
 * Providers (set PAYMENT_PROVIDER in Backend/.env):
 *   • "jazzcash"  — JazzCash HTTP-POST page redirection (HMAC-SHA256 secure hash)
 *   • "easypaisa" — Easypaisa Easypay hosted checkout (AES-128 hashed request)
 *   • "safepay" / any — generic JSON hosted-checkout + HMAC webhook (the previous behaviour)
 *   • unset / "manual" — DISABLED; the app keeps using the manual proof-upload flow
 *
 * Nothing here runs until the provider's credentials are present, so the live
 * site is unaffected until you drop keys in .env. Escrow model: the traveller
 * pays the gateway → we mark the booking paid + funds "Held" in escrow → funds
 * are released to the partner on trip confirmation (see paymentController).
 *
 * Redirect providers (jazzcash/easypaisa) settle via a browser POST to
 * /api/pay/callback; the generic provider settles via a server webhook to
 * /api/pay/webhook. createCheckout() returns EITHER { url } (redirect the
 * browser) OR { form: { action, fields } } (auto-submit a POST form).
 */
const PROVIDER = (process.env.PAYMENT_PROVIDER || "manual").toLowerCase();

// ── JazzCash ─────────────────────────────────────────────────────────────────
const JC = {
  merchantId: process.env.JAZZCASH_MERCHANT_ID || "",
  password: process.env.JAZZCASH_PASSWORD || "",
  salt: process.env.JAZZCASH_INTEGRITY_SALT || "",
  postUrl: process.env.JAZZCASH_POST_URL ||
    "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
};

// ── Easypaisa (Easypay) ──────────────────────────────────────────────────────
const EP = {
  storeId: process.env.EASYPAISA_STORE_ID || "",
  hashKey: process.env.EASYPAISA_HASH_KEY || "",
  postUrl: process.env.EASYPAISA_POST_URL || "https://easypay.easypaisa.com.pk/easypay/Index.jsf",
};

// ── Generic JSON provider (Safepay/PayFast shaped) ───────────────────────────
const GEN = {
  apiKey: process.env.PAYMENT_API_KEY || "",
  webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || "",
  createUrl: process.env.PAYMENT_CREATE_URL || "",
  checkoutUrl: process.env.PAYMENT_CHECKOUT_URL || "",
};

const REDIRECT_PROVIDERS = new Set(["jazzcash", "easypaisa"]);

function providerEnabled(p) {
  if (p === "jazzcash") return Boolean(JC.merchantId && JC.password && JC.salt);
  if (p === "easypaisa") return Boolean(EP.storeId && EP.hashKey);
  if (p === "manual") return false;
  return Boolean(GEN.apiKey && GEN.createUrl); // generic
}

const enabled = providerEnabled(PROVIDER);

// yyyyMMddHHmmss in local server time (what JazzCash expects).
function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// ── JazzCash secure hash: HMAC-SHA256 over integrity-salt + '&' + values of all
// non-empty pp_*/ppmpf_ fields, keys sorted ascending. Returns UPPERCASE hex. ──
function jazzcashHash(fields) {
  const keys = Object.keys(fields)
    .filter((k) => (k.startsWith("pp_") || k.startsWith("ppmpf_")) && k !== "pp_SecureHash")
    .filter((k) => fields[k] !== "" && fields[k] != null)
    .sort();
  const str = JC.salt + "&" + keys.map((k) => fields[k]).join("&");
  return crypto.createHmac("sha256", JC.salt).update(str).digest("hex").toUpperCase();
}

function jazzcashCheckout({ amount, orderRef, customerEmail, successUrl }) {
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const fields = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: JC.merchantId,
    pp_SubMerchantID: "",
    pp_Password: JC.password,
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: `T${stamp(now)}`,
    pp_Amount: String(Math.round(Number(amount) * 100)), // paisa
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: stamp(now),
    pp_BillReference: orderRef, // our booking ref — echoed back on the callback
    pp_Description: `Misty Mounts booking ${orderRef}`,
    pp_TxnExpiryDateTime: stamp(expiry),
    pp_ReturnURL: successUrl,
    ppmpf_1: customerEmail || "",
  };
  fields.pp_SecureHash = jazzcashHash(fields);
  return { form: { action: JC.postUrl, fields } };
}

// ── Easypaisa hashed request: AES-128-ECB(key=hashKey) over the a=b&c=d string
// of params sorted by key, base64-encoded. ──────────────────────────────────
function easypaisaHash(params) {
  const str = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const key = Buffer.from(EP.hashKey, "utf8"); // must be 16 bytes for AES-128
  const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
  return Buffer.concat([cipher.update(str, "utf8"), cipher.final()]).toString("base64");
}

function easypaisaCheckout({ amount, orderRef, customerEmail, successUrl }) {
  const expiry = stamp(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const params = {
    amount: Number(amount).toFixed(1),
    expiryDate: expiry,
    orderRefNum: orderRef,
    paymentMethod: "InitialRequest",
    postBackURL: successUrl,
    storeId: EP.storeId,
  };
  const merchantHashedReq = easypaisaHash(params);
  return {
    form: {
      action: EP.postUrl,
      fields: { ...params, merchantHashedReq, emailAddr: customerEmail || "" },
    },
  };
}

async function genericCheckout({ amount, currency, orderRef, customerEmail, successUrl, cancelUrl, metadata }) {
  const res = await fetch(GEN.createUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GEN.apiKey}` },
    body: JSON.stringify({
      amount, currency, reference: orderRef, customer_email: customerEmail,
      redirect_url: successUrl, cancel_url: cancelUrl, metadata: { ...metadata, ref: orderRef },
    }),
  });
  if (!res.ok) throw new Error(`gateway session failed: ${res.status}`);
  const data = await res.json().catch(() => ({}));
  const url =
    data.url || data.checkout_url || data?.data?.url ||
    (GEN.checkoutUrl && (data.token || data?.data?.token) ? `${GEN.checkoutUrl}?beacon=${data.token || data.data.token}` : "");
  if (!url) throw new Error("no checkout url in gateway response");
  return { url, sessionId: data.token || data.id || data?.data?.token };
}

/**
 * Create a checkout for one booking.
 * @returns {Promise<{ url?: string, form?: { action: string, fields: object } }>}
 */
async function createCheckout(opts) {
  if (!enabled) throw new Error("payment gateway not configured");
  if (PROVIDER === "jazzcash") return jazzcashCheckout(opts);
  if (PROVIDER === "easypaisa") return easypaisaCheckout(opts);
  return genericCheckout({ currency: "PKR", metadata: {}, ...opts });
}

/** Verify a generic JSON webhook's signature against the raw body. Fails CLOSED. */
function verifySignature(rawBody, signature) {
  if (!GEN.webhookSecret) return false;
  if (!signature || !rawBody) return false;
  try {
    const digest = crypto.createHmac("sha256", GEN.webhookSecret).update(rawBody).digest("hex");
    const a = Buffer.from(digest);
    const b = Buffer.from(String(signature));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

/** Normalise a generic JSON webhook payload → { ref, success, status, txnId }. */
function parseWebhook(body) {
  const ref = body?.data?.reference || body?.reference || body?.metadata?.ref || body?.order_id || body?.orderRef;
  const status = String(body?.data?.status || body?.status || "").toLowerCase();
  const success = ["paid", "succeeded", "success", "completed", "captured", "approved"].includes(status);
  const txnId = body?.data?.id || body?.transaction_id || body?.txn_id || "";
  return { ref, success, status, txnId };
}

/**
 * Verify + interpret a redirect-provider callback (browser POST to /api/pay/callback).
 * @returns {{ ref: string, success: boolean, txnId: string, valid: boolean }}
 */
function verifyReturn(params = {}) {
  if (PROVIDER === "jazzcash") {
    const got = String(params.pp_SecureHash || "").toUpperCase();
    const expected = jazzcashHash(params);
    const valid = got.length > 0 && got === expected;
    return {
      ref: params.pp_BillReference || "",
      success: valid && String(params.pp_ResponseCode) === "000",
      txnId: params.pp_TxnRefNo || "",
      valid,
    };
  }
  if (PROVIDER === "easypaisa") {
    // Easypaisa posts back orderRefNum + a status/paymentToken. There is no
    // shared-secret signature on the return, so treat the callback as advisory
    // and reconcile status here; success requires an explicit success flag.
    const status = String(params.status || params.transactionStatus || "").toUpperCase();
    return {
      ref: params.orderRefNum || params.orderRefNumber || "",
      success: ["PAID", "SUCCESS", "COMPLETED", "0000"].includes(status),
      txnId: params.transactionId || params.paymentToken || "",
      valid: true,
    };
  }
  return { ref: "", success: false, txnId: "", valid: false };
}

module.exports = {
  enabled,
  provider: PROVIDER,
  isRedirect: REDIRECT_PROVIDERS.has(PROVIDER),
  createCheckout,
  verifySignature,
  parseWebhook,
  verifyReturn,
};
