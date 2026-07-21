/**
 * Frontend-only validation helpers (the backend is intentionally disconnected).
 *
 * Two layers:
 *  1. Predicate helpers (isEmail, isPhone, isUrl) for one-off checks.
 *  2. Rule builders (`required`, `email`, `min`, …) that each return a
 *     `(value, allValues) => errorMessage | ''` function, composed into a schema
 *     and run with `validate(values, schema)` → `{ field: firstErrorMessage }`.
 *
 * Usage:
 *   const schema = {
 *     email: [required(), email()],
 *     price: [required('Price is required'), number(), min(0)],
 *   };
 *   const errors = validate(form, schema);
 *   if (hasErrors(errors)) { setErrors(errors); return; }
 */

// ── Predicates ────────────────────────────────────────────────────────────────
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

export const isPhone = (v) => {
  const s = String(v).trim();
  return /^[+]?[\d\s().-]{7,20}$/.test(s) && s.replace(/\D/g, "").length >= 7;
};

export const isUrl = (v) => /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(String(v).trim());

const isEmpty = (v) =>
  v === undefined || v === null || v === false || (typeof v === "string" && v.trim() === "");

// ── Rule builders — each returns (value, allValues) => "" | errorMessage ───────
export const required =
  (msg = "This field is required") =>
  (v) =>
    isEmpty(v) ? msg : "";

export const email =
  (msg = "Enter a valid email address") =>
  (v) =>
    !isEmpty(v) && !isEmail(v) ? msg : "";

export const phone =
  (msg = "Enter a valid phone number") =>
  (v) =>
    !isEmpty(v) && !isPhone(v) ? msg : "";

export const url =
  (msg = "Enter a valid URL (https://…)") =>
  (v) =>
    !isEmpty(v) && !isUrl(v) ? msg : "";

export const minLen =
  (n, msg) =>
  (v) =>
    !isEmpty(v) && String(v).trim().length < n ? msg || `Must be at least ${n} characters` : "";

export const maxLen =
  (n, msg) =>
  (v) =>
    !isEmpty(v) && String(v).trim().length > n ? msg || `Must be ${n} characters or fewer` : "";

export const number =
  (msg = "Enter a valid number") =>
  (v) =>
    isEmpty(v) ? "" : isNaN(Number(v)) ? msg : "";

export const integer =
  (msg = "Enter a whole number") =>
  (v) =>
    isEmpty(v) ? "" : !Number.isInteger(Number(v)) ? msg : "";

export const min =
  (n, msg) =>
  (v) =>
    !isEmpty(v) && !isNaN(Number(v)) && Number(v) < n ? msg || `Must be at least ${n}` : "";

export const max =
  (n, msg) =>
  (v) =>
    !isEmpty(v) && !isNaN(Number(v)) && Number(v) > n ? msg || `Must be ${n} or less` : "";

export const oneOf =
  (options, msg = "Please select an option") =>
  (v) =>
    options.includes(v) ? "" : msg;

export const mustBeTrue =
  (msg = "This is required") =>
  (v) =>
    v === true ? "" : msg;

/** Date (yyyy-mm-dd) must be today or later. */
export const notPast =
  (msg = "Choose today or a future date") =>
  (v) => {
    if (isEmpty(v)) return "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(v);
    return isNaN(d.getTime()) || d < today ? msg : "";
  };

/** Match `other` field's value — handy for confirm-password style checks. */
export const matches =
  (otherField, msg = "Values do not match") =>
  (v, all) =>
    v !== all?.[otherField] ? msg : "";

// ── Runner ────────────────────────────────────────────────────────────────────
/** Run schema `{ field: [rule, …] }` against `values` → `{ field: firstError }`. */
export const validate = (values, schema) => {
  const errors = {};
  for (const field in schema) {
    for (const rule of schema[field]) {
      const err = rule(values[field], values);
      if (err) {
        errors[field] = err;
        break;
      }
    }
  }
  return errors;
};

export const hasErrors = (errors) => Object.values(errors).some(Boolean);

/** Local date as `yyyy-mm-dd` — for <input type="date" min={todayStr()}>. */
export const todayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
