const express = require('express');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Trip = require('../models/TripRequest');
const User = require('../LocalGuidePannel/models/User');
const { authenticate, requireRole } = require('../middleware/auth');
const { getRevenueConfig } = require('../AdminBackend/controllers/settingsController');
const { requestInput, quoteInput, supplierRole, text, number, money } = require('../utils/tripCommerce');
const router = express.Router();
const run = handler => async (req, res) => {
  try { await handler(req, res); }
  catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'This request or payment reference was already recorded. Refresh to see its status.' });
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Could not update the trip. Please retry.' });
  }
};
const id = value => typeof value === 'string' && mongoose.isValidObjectId(value);
const event = (req, action) => ({ action, actor: req.user.type, at: new Date() });
const visibleTrip = (trip, role) => {
  const value = trip.toObject ? trip.toObject() : { ...trip };
  if (!['admin', 'user'].includes(role)) {
    for (const key of ['paymentReference', 'refundReference', 'support', 'requestKey', 'userId']) delete value[key];
  }
  return value;
};
router.use(authenticate, requireRole('user', 'hotel', 'local guide', 'travel agency', 'admin'));
router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

router.get('/config', run(async (_req, res) => {
  const phone = process.env.CONCIERGE_WHATSAPP_NUMBER || '';
  const { commissionPercent } = await getRevenueConfig();
  res.json({ whatsappNumber: /^\d{8,15}$/.test(phone) ? phone : null, commissionPercent });
}));
router.get('/suppliers', run(async (req, res) => {
  const role = supplierRole[req.query.service];
  if (!role) return res.status(400).json({ error: 'Choose a service.' });
  const suppliers = await User.find({ type: role, isApproved: true }).select('name username hotelName agencyName city serviceAreas verificationStatus verifiedAt').limit(200).lean();
  res.json({ suppliers: suppliers.map(user => ({ id: user._id, name: user.hotelName || user.agencyName || user.name || user.username, city: user.city, serviceAreas: user.serviceAreas, identityReviewed: user.verificationStatus === 'verified', verifiedAt: user.verifiedAt })) });
}));
router.get('/metrics', requireRole('admin'), run(async (_req, res) => {
  const [stats] = await Trip.aggregate([{ $group: {
    _id: null, inquiries: { $sum: 1 },
    quoted: { $sum: { $cond: ['$quote.confirmedAt', 1, 0] } },
    accepted: { $sum: { $cond: ['$acceptedAt', 1, 0] } },
    paid: { $sum: { $cond: ['$paidAt', 1, 0] } },
    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
    cancelled: { $sum: { $cond: [{ $in: ['$status', ['cancelled', 'refunded']] }, 1, 0] } },
    grossBookingValue: { $sum: { $cond: ['$paidAt', '$quote.total', 0] } },
    refunds: { $sum: { $ifNull: ['$refundAmount', 0] } },
    supplierPayouts: { $sum: { $ifNull: ['$payoutAmount', 0] } },
    earnedCommission: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, { $divide: [{ $multiply: ['$quote.total', '$quote.commissionPercent'] }, 100] }, 0] } },
    supportMinutes: { $sum: { $ifNull: ['$support.minutes', 0] } },
    averageQuoteHours: { $avg: { $cond: ['$quote.confirmedAt', { $divide: [{ $subtract: ['$quote.confirmedAt', '$createdAt'] }, 3600000] }, null] } },
  } }]);
  res.json({ scope: 'All trip requests since launch; excludes legacy hotel/tour bookings. Commission is before operating costs.', ...(stats || { inquiries: 0, quoted: 0, accepted: 0, paid: 0, completed: 0, cancelled: 0, grossBookingValue: 0, refunds: 0, supplierPayouts: 0, earnedCommission: 0, supportMinutes: 0, averageQuoteHours: null }), conversionPercent: stats?.inquiries ? money(stats.paid / stats.inquiries * 100) : 0 });
}));
router.get('/', run(async (req, res) => {
  const filter = req.user.type === 'admin' ? {} : req.user.type === 'user' ? { userId: req.user.id } : { supplierId: req.user.id };
  const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
  const trips = await Trip.find(filter).sort({ createdAt: -1 }).skip((page - 1) * 25).limit(26).lean();
  const hasMore = trips.length > 25;
  res.json({ trips: trips.slice(0, 25).map(trip => visibleTrip(trip, req.user.type)), hasMore });
}));
router.post('/', requireRole('user'), run(async (req, res) => {
  const input = requestInput(req.body);
  const requestKey = text(req.body.requestKey, 'Request key', 100);
  if (!id(req.body.supplierId)) return res.status(400).json({ error: 'Choose a supplier.' });
  const existing = await Trip.findOne({ userId: req.user.id, requestKey });
  if (existing) return res.json({ trip: existing });
  const supplier = await User.findOne({ _id: req.body.supplierId, type: supplierRole[input.service], isApproved: true });
  if (!supplier) return res.status(400).json({ error: 'This supplier is not available for that service.' });
  const trip = await Trip.create({ ...input, requestKey, userId: req.user.id, supplierId: supplier._id, supplierName: supplier.hotelName || supplier.agencyName || supplier.name || supplier.username, ref: `TR-${crypto.randomUUID()}`, history: [event(req, 'requested')] });
  res.status(201).json({ trip });
}));

router.post('/:id/action', run(async (req, res) => {
  if (!id(req.params.id)) return res.status(400).json({ error: 'Invalid trip.' });
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });
  const admin = req.user.type === 'admin';
  const owner = req.user.type === 'user' && String(trip.userId) === req.user.id;
  const supplier = String(trip.supplierId) === req.user.id && ['hotel', 'local guide', 'travel agency'].includes(req.user.type);
  if (!admin && !owner && !supplier) return res.status(404).json({ error: 'Trip not found.' });
  const action = req.body?.action;
  let changes;
  const deny = message => res.status(409).json({ error: message || 'This action is not available for the current trip status.' });
  if (action === 'quote' && supplier && trip.status === 'requested') {
    const account = await User.findOne({ _id: req.user.id, isApproved: true });
    if (!account) return res.status(403).json({ error: 'Supplier approval is required.' });
    const { commissionPercent } = await getRevenueConfig();
    const quote = quoteInput(req.body, commissionPercent);
    if (quote.expiresAt > new Date(`${trip.startDate}T23:59:59Z`)) return deny('Quote must expire no later than the first travel day.');
    changes = { quote, status: 'quoted' };
  } else if (action === 'decline' && supplier && trip.status === 'requested') {
    changes = { status: 'declined' };
  } else if (action === 'accept' && owner && trip.status === 'quoted') {
    if (req.body.acceptTerms !== true || new Date(trip.quote.expiresAt) <= new Date()) return deny('Accept the terms of an unexpired quote.');
    changes = { status: 'accepted', acceptedAt: new Date() };
  } else if (action === 'record-payment' && admin && trip.status === 'accepted') {
    if (new Date(trip.quote.expiresAt) <= new Date()) return deny('The quote has expired. Request a new quote before taking payment.');
    if (req.body.amount !== trip.quote.total || req.body.confirmed !== true) return deny('Independently verify receipt of the exact PKR quote total before recording payment.');
    changes = { status: 'paid', paidAt: new Date(), paymentProvider: 'manual', paymentReference: text(req.body.reference, 'Bank transaction reference', 200) };
  } else if (action === 'cancel' && owner && ['requested', 'quoted', 'accepted'].includes(trip.status)) {
    changes = { status: 'cancelled' };
  } else if (action === 'request-refund' && owner && trip.status === 'paid') {
    changes = { status: 'refund_requested', refundNote: text(req.body.note, 'Reason') };
  } else if (action === 'record-refund' && admin && trip.status === 'refund_requested') {
    if (req.body.confirmed !== true) return deny('Confirm the refund has actually been transferred.');
    changes = { status: 'refunded', refundAmount: number(req.body.amount, 'Refund amount', 0.01, trip.quote.total), refundReference: text(req.body.reference, 'Refund transaction reference', 200) };
  } else if (action === 'complete' && owner && trip.status === 'paid') {
    if (new Date() < new Date(`${trip.endDate}T23:59:59Z`)) return deny('Confirm completion after your final travel day.');
    changes = { status: 'completed', completedAt: new Date() };
  } else if (action === 'record-payout' && admin && trip.status === 'completed' && !trip.payoutReference) {
    const expected = money(trip.quote.total * (1 - trip.quote.commissionPercent / 100));
    if (req.body.amount !== expected || req.body.confirmed !== true) return deny(`Verify a supplier transfer of PKR ${expected} before recording it.`);
    changes = { payoutAmount: expected, payoutReference: text(req.body.reference, 'Payout transaction reference', 200) };
  } else if (action === 'review' && owner && trip.status === 'completed' && !trip.review?.createdAt) {
    changes = { review: { rating: number(req.body.rating, 'Rating', 1, 5, true), text: text(req.body.text, 'Review', 1000), createdAt: new Date() } };
  } else if (action === 'support' && owner && !trip.support?.openedAt) {
    changes = { support: { message: text(req.body.message, 'Support request'), openedAt: new Date(), minutes: 0 } };
  } else if (action === 'resolve-support' && admin && trip.support?.openedAt && !trip.support.closedAt) {
    changes = { 'support.resolution': text(req.body.resolution, 'Resolution'), 'support.closedAt': new Date(), 'support.minutes': number(req.body.minutes, 'Support minutes', 1, 10000, true) };
  } else return deny();
  // Compare the version as well as status: simultaneous writes cannot overwrite
  // support, payment, payout or review changes made by another request.
  const updated = await Trip.findOneAndUpdate({ _id: trip._id, __v: trip.__v, status: trip.status }, { $set: changes, $inc: { __v: 1 }, $push: { history: { $each: [event(req, action)], $slice: -50 } } }, { new: true, runValidators: true });
  if (!updated) return deny('The trip changed. Refresh before trying again.');
  res.json({ trip: visibleTrip(updated, req.user.type) });
}));
module.exports = router;
