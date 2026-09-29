const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const Trip = require('../models/TripRequest');
const User = require('../LocalGuidePannel/models/User');
const settings = require('../AdminBackend/controllers/settingsController');

test('trip API enforces ownership, quote acceptance, payment transitions, retries and version conflicts', { timeout: 20000 }, async () => {
  const originals = { findOne: Trip.findOne, findById: Trip.findById, create: Trip.create, update: Trip.findOneAndUpdate, supplier: User.findOne, config: settings.getRevenueConfig, secret: process.env.JWT_SECRET };
  process.env.JWT_SECRET = 'trip-test-secret';
  const owner = '000000000000000000000001', supplier = '000000000000000000000002', outsider = '000000000000000000000003', tripId = '000000000000000000000004';
  let saved, writes = 0, conflict = false;
  const clone = value => value ? structuredClone(value) : value;
  Trip.findOne = async filter => saved && saved.userId === filter.userId && saved.requestKey === filter.requestKey ? clone(saved) : null;
  Trip.findById = async () => clone(saved);
  Trip.create = async values => { writes++; saved = { ...values, _id: tripId, __v: 0, status: 'requested' }; return clone(saved); };
  Trip.findOneAndUpdate = async (filter, update) => {
    assert.equal(filter._id, tripId);
    if (conflict || filter.__v !== saved.__v || filter.status !== saved.status) return null;
    for (const [key, value] of Object.entries(update.$set)) {
      if (key.startsWith('support.')) saved.support[key.split('.')[1]] = value;
      else saved[key] = value;
    }
    saved.__v++; saved.history.push(...update.$push.history.$each);
    return clone(saved);
  };
  User.findOne = async filter => filter._id === supplier ? { _id: supplier, type: 'travel agency', name: 'Pilot agency' } : null;
  settings.getRevenueConfig = async () => ({ commissionPercent: 15 });
  const app = express(); app.use(express.json()); app.use('/trips', require('../routes/tripRequestRoutes'));
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const call = (path, body, type = 'user', user = owner) => fetch(`http://127.0.0.1:${server.address().port}/trips${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(type ? { Authorization: `Bearer ${jwt.sign({ id: user, type }, process.env.JWT_SECRET, { expiresIn: '1h' })}` } : {}) }, body: JSON.stringify(body) });
  const action = (body, type, user) => call(`/${tripId}/action`, body, type, user);
  const date = days => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  const request = { requestKey: 'one-intent', supplierId: supplier, service: 'complete trip', destination: 'Hunza', startDate: date(3), endDate: date(7), people: 4, budget: 100000, requirements: 'Family holiday' };
  try {
    assert.equal((await call('/', request, null)).status, 401);
    assert.equal((await call('/', request, 'hotel', supplier)).status, 403);
    assert.equal((await call('/', request)).status, 201);
    assert.equal((await call('/', request)).status, 200);
    assert.equal(writes, 1);
    assert.equal((await action({ action: 'accept', acceptTerms: true }, 'user', outsider)).status, 404);
    assert.equal((await action({ action: 'record-payment', confirmed: true, amount: 10, reference: 'forged' })).status, 409);
    const quoted = await action({ action: 'quote', availabilityConfirmed: true, items: [{ label: 'Complete package', quantity: 1, unitPrice: 80000 }], terms: 'Bank transfer; refundable up to departure.', exclusions: 'Flights', expiresAt: new Date(Date.now() + 86400000).toISOString() }, 'travel agency', supplier);
    assert.equal(quoted.status, 200);
    assert.equal((await quoted.json()).trip.userId, undefined);
    assert.equal((await action({ action: 'accept' })).status, 409);
    conflict = true;
    assert.equal((await action({ action: 'accept', acceptTerms: true })).status, 409);
    conflict = false;
    assert.equal((await action({ action: 'accept', acceptTerms: true })).status, 200);
    assert.equal((await action({ action: 'record-payment', confirmed: true, amount: 1, reference: 'bank-1' }, 'admin', outsider)).status, 409);
    assert.equal((await action({ action: 'record-payment', confirmed: true, amount: 80000, reference: 'bank-1' }, 'admin', outsider)).status, 200);
    assert.equal((await action({ action: 'record-payment', confirmed: true, amount: 80000, reference: 'bank-1' }, 'admin', outsider)).status, 409);
    assert.equal((await action({ action: 'cancel' })).status, 409);
    assert.equal((await action({ action: 'complete' })).status, 409);
    assert.equal((await action({ action: 'review', rating: 5, text: 'Fake early review' })).status, 409);
    assert.equal((await action({ action: 'support', message: 'Need assistance' })).status, 200);
    assert.equal((await action({ action: 'resolve-support', resolution: 'Called supplier', minutes: 12 }, 'admin', outsider)).status, 200);
    saved.endDate = date(-1);
    assert.equal((await action({ action: 'complete' })).status, 200);
    assert.equal((await action({ action: 'review', rating: 5, text: 'Great trip' })).status, 200);
    assert.equal((await action({ action: 'review', rating: 5, text: 'Duplicate review' })).status, 409);
    assert.equal((await action({ action: 'record-payout', amount: 68000, reference: 'payout-1', confirmed: true }, 'admin', outsider)).status, 200);
    assert.equal((await action({ action: 'record-payout', amount: 68000, reference: 'payout-2', confirmed: true }, 'admin', outsider)).status, 409);
    saved.status = 'paid'; delete saved.payoutReference;
    assert.equal((await action({ action: 'request-refund', note: 'Unable to travel' })).status, 200);
    assert.equal((await action({ action: 'complete' })).status, 409);
    assert.equal((await action({ action: 'record-refund', amount: 90000, reference: 'refund-1', confirmed: true }, 'admin', outsider)).status, 400);
    assert.equal((await action({ action: 'record-refund', amount: 80000, reference: 'refund-1', confirmed: true }, 'admin', outsider)).status, 200);
  } finally {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    Trip.findOne = originals.findOne; Trip.findById = originals.findById; Trip.create = originals.create; Trip.findOneAndUpdate = originals.update; User.findOne = originals.supplier; settings.getRevenueConfig = originals.config;
    if (originals.secret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = originals.secret;
  }
});
