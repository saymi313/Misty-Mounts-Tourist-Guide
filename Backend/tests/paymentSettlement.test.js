const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const crypto = require('node:crypto');
const Trip = require('../models/TripRequest');
const Booking = require('../UserBackend/models/booking');
const TourBooking = require('../UserBackend/models/tourBooking');

test('webhook rejects forged or mismatched payments, settles once, and never revives cancelled trips', { timeout: 15000 }, async () => {
  process.env.PAYMENT_PROVIDER = 'bridge'; process.env.PAYMENT_API_KEY = 'test'; process.env.PAYMENT_CREATE_URL = 'https://example.invalid'; process.env.PAYMENT_WEBHOOK_SECRET = 'test-secret';
  const original = { find: Trip.findOne, update: Trip.findOneAndUpdate, hotel: Booking.findOne, tour: TourBooking.findOne };
  let record = { _id: 'trip', ref: 'TR-test', __v: 0, status: 'accepted', quote: { total: 10000, expiresAt: new Date(Date.now() + 86400000) } }, updates = 0;
  Trip.findOne = async ({ ref }) => ref === record.ref ? structuredClone(record) : null;
  Booking.findOne = TourBooking.findOne = async () => null;
  Trip.findOneAndUpdate = async (filter, update) => {
    assert.equal(filter.status, 'accepted');
    if (record.status !== filter.status || record.__v !== filter.__v || record.quote.expiresAt <= filter['quote.expiresAt'].$gt) return null;
    updates++; Object.assign(record, update.$set); record.__v++; return structuredClone(record);
  };
  const app = express();
  app.use(express.json({ verify: (req, _res, buffer) => { req.rawBody = buffer; } }));
  app.use('/pay', require('../routes/paymentGatewayRoutes'));
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const send = (patch = {}, forged = false) => {
    const body = JSON.stringify({ reference: record.ref, status: 'paid', amount: 10000, currency: 'PKR', transaction_id: 'bank-123', ...patch });
    const signature = crypto.createHmac('sha256', 'test-secret').update(body).digest('hex');
    return fetch(`http://127.0.0.1:${server.address().port}/pay/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-signature': forged ? 'forged' : signature }, body });
  };
  try {
    assert.equal((await send({}, true)).status, 401);
    assert.equal((await send({ amount: 1 })).status, 409);
    assert.equal((await send({ currency: 'USD' })).status, 409);
    assert.equal((await send({ transaction_id: '' })).status, 409);
    assert.equal((await send()).status, 200);
    assert.equal(record.status, 'paid');
    assert.equal((await send()).status, 200);
    assert.equal(updates, 1);
    assert.equal((await send({ transaction_id: 'different-charge' })).status, 409);
    record = { ...record, status: 'cancelled', paidAt: undefined, paymentReference: undefined };
    assert.equal((await send()).status, 409);
    record.status = 'accepted'; record.quote.expiresAt = new Date(0);
    assert.equal((await send()).status, 409);
    assert.equal(updates, 1);
  } finally {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    Trip.findOne = original.find; Trip.findOneAndUpdate = original.update; Booking.findOne = original.hotel; TourBooking.findOne = original.tour;
  }
});
