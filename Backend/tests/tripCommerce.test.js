const test = require('node:test');
const assert = require('node:assert/strict');
const { requestInput, quoteInput, paymentMatches } = require('../utils/tripCommerce');
const now = new Date('2030-01-01T00:00:00Z');
const request = { service: 'complete trip', destination: 'Hunza', startDate: '2030-02-01', endDate: '2030-02-05', people: 4, budget: 200000, requirements: 'Family trip with two rooms' };
test('trip requirements reject impossible dates, nonnumeric budgets and oversized requests', () => {
  assert.equal(requestInput(request, now).destination, 'Hunza');
  for (const patch of [{ people: 1.5 }, { budget: '200000' }, { budget: Infinity }, { startDate: '2029-01-01' }, { startDate: '2030-02-30' }, { endDate: '2031-01-01' }, { requirements: 'x'.repeat(2001) }]) assert.throws(() => requestInput({ ...request, ...patch }, now));
  assert.throws(() => requestInput(null));
});
test('supplier quotes recompute totals and require availability and cancellation terms', () => {
  const input = { items: [{ label: 'Room nights', quantity: 4, unitPrice: 5000.25, total: 1 }], total: 1, expiresAt: '2030-01-02', terms: 'Refundable until 48 hours before departure.', exclusions: 'Flights', availabilityConfirmed: true };
  const quote = quoteInput(input, 15, now);
  assert.equal(quote.total, 20001);
  assert.equal(quote.commissionPercent, 15);
  assert.equal(quote.currency, 'PKR');
  for (const patch of [{ availabilityConfirmed: false }, { terms: '' }, { expiresAt: '2029-01-01' }, { expiresAt: '2030-02-01' }, { items: [] }]) assert.throws(() => quoteInput({ ...input, ...patch }, 15, now));
});
test('payment evidence must include the matching amount, currency and transaction ID', () => {
  const evidence = { amount: 1000, currency: 'PKR', txnId: 'bank-123' };
  assert.equal(paymentMatches({ amount: 1000 }, evidence), true);
  for (const patch of [{ amount: 1 }, { amount: NaN }, { currency: 'USD' }, { txnId: '' }, { amount: '1000' }]) assert.equal(paymentMatches({ amount: 1000 }, { ...evidence, ...patch }), false);
});
