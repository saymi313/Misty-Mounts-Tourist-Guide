const fail = message => { const error = new Error(message); error.status = 400; throw error; };
const text = (value, name, max = 2000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(`${name} is required (maximum ${max} characters).`);
  return value.trim();
};
const number = (value, name, min, max, integer = false) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) fail(`${name} is invalid.`);
  return value;
};
const money = value => Math.round(value * 100) / 100;
function requestInput(body, now = new Date()) {
  if (!body || typeof body !== 'object') fail('Trip details are required.');
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!date(body.startDate) || !date(body.endDate) || body.startDate < now.toISOString().slice(0, 10) || body.endDate < body.startDate || (Date.parse(body.endDate) - Date.parse(body.startDate)) / 86400000 > 60) fail('Choose valid travel dates, up to 60 days apart, starting today or later.');
  if (!['complete trip', 'stay', 'guide', 'transport'].includes(body.service)) fail('Choose a service.');
  return { service: body.service, destination: text(body.destination, 'Destination', 120), startDate: body.startDate, endDate: body.endDate, people: number(body.people, 'Travelers', 1, 100, true), budget: number(body.budget, 'Budget', 1, 10000000), requirements: text(body.requirements, 'Requirements'), itinerary: body.itinerary ? text(body.itinerary, 'Itinerary', 12000) : '' };
}
function quoteInput(body, commissionPercent, now = new Date()) {
  if (!body || typeof body !== 'object') fail('Quote details are required.');
  if (body.availabilityConfirmed !== true) fail('Confirm availability for these dates before quoting.');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 30) fail('Add 1–30 price items.');
  const items = body.items.map(item => {
    const quantity = number(item.quantity, 'Quantity', 1, 1000, true);
    const unitPrice = money(number(item.unitPrice, 'Unit price', 0, 10000000));
    return { label: text(item.label, 'Item', 160), quantity, unitPrice, total: money(quantity * unitPrice) };
  });
  const total = money(items.reduce((sum, item) => sum + item.total, 0));
  number(total, 'Quote total', 1, 10000000);
  const expiresAt = new Date(body.expiresAt);
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= now || expiresAt - now > 7 * 86400000) fail('Quote expiry must be within the next seven days.');
  return { items, total, currency: 'PKR', terms: text(body.terms, 'Cancellation and payment terms'), exclusions: text(body.exclusions, 'Exclusions'), expiresAt, confirmedAt: now, commissionPercent: number(commissionPercent, 'Commission', 0, 100) };
}
const supplierRole = { 'complete trip': 'travel agency', stay: 'hotel', guide: 'local guide', transport: 'travel agency' };
function paymentMatches(booking, evidence) {
  return typeof evidence.txnId === 'string' && evidence.txnId.length > 0 && evidence.txnId.length <= 200 && evidence.currency === 'PKR' && Number.isFinite(evidence.amount) && money(evidence.amount) === money(booking.amount);
}
module.exports = { requestInput, quoteInput, supplierRole, paymentMatches, text, number, money };
