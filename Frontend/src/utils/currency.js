/**
 * Currency helpers. The platform prices everything in Pakistani Rupees (PKR).
 * `formatPKR(27000)` → "Rs 27,000".
 */
export const formatPKR = (n) => `Rs ${(Number(n) || 0).toLocaleString("en-US")}`;

/** Rupee prefix for count-up StatCards and other numeric widgets. */
export const PKR_PREFIX = "Rs ";
