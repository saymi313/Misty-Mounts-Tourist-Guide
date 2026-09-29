const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { reserveTour, verifyTour } = require('../../utils/tourReservation');
const Tour = require('../../UserBackend/models/tourPackage');
const Booking = require('../../UserBackend/models/tourBooking');
const User = require('../../LocalGuidePannel/models/User');

test('concurrent reservations, credits, payment transitions and payouts remain consistent', { timeout: 1800000 }, async () => {
  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  try {
    await mongoose.connect(repl.getUri());
    await Promise.all([Tour.init(), Booking.init(), User.init()]);
    const agencyId = new mongoose.Types.ObjectId(), userId = new mongoose.Types.ObjectId();
    await User.collection.insertOne({ _id: agencyId, email: 'agency@example.invalid', username: 'agency-test', isApproved: true });
    const tour = await Tour.create({ _id: 'concurrency-test', agencyId, title: 'Test tour', isApproved: true,
      pricePerPerson: 1000, departures: [{ date: new Date(Date.now() + 86400000), seatsTotal: 4 }] });
    const input = { packageId: tour.id, departureId: String(tour.departures[0]._id), seats: 1 };
    await assert.rejects(reserveTour(userId, { ...input, guestName: { invalid: true } }));
    assert.equal((await Tour.findById(tour.id)).departures[0].seatsBooked, 0);
    const results = await Promise.allSettled(Array.from({ length: 12 }, () => reserveTour(userId, input)));
    const succeeded = results.filter(r => r.status === 'fulfilled');
    assert.equal(succeeded.length, 4);
    assert.equal(await Booking.countDocuments(), 4);
    assert.equal((await Tour.findById(tour.id)).departures[0].seatsBooked, 4);
    assert.equal(new Set(succeeded.map(r => r.value.booking.ref)).size, 4);
    const id = succeeded[0].value.booking.id;
    const rejects = await Promise.allSettled([verifyTour(id, false), verifyTour(id, false)]);
    assert.equal(rejects.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal((await Tour.findById(tour.id)).departures[0].seatsBooked, 3);
    await assert.rejects(verifyTour(id, true), { status: 409 });
    await assert.rejects(reserveTour(userId, { ...input, seats: 1.5 }), { status: 400 });
    // A stale agency edit cannot overwrite a concurrent reservation.
    const stale = await Tour.findById(tour.id);
    await reserveTour(userId, input);
    stale.title = 'Stale edit';
    await assert.rejects(stale.save(), { name: 'VersionError' });

    const notifications = require('../../UserBackend/controllers/notificationController');
    notifications.createNotification = async () => {};
    const payments = require('../../UserBackend/controllers/paymentController');
    const Stay = require('../../AdminBackend/models/Accommodation');
    const StayBooking = require('../../UserBackend/models/booking');
    const Payout = require('../../UserBackend/models/payout');
    const Earning = require('../../UserBackend/models/earning');
    const Guard = require('../../models/PayoutGuard');
    await Promise.all([StayBooking.init(), Payout.init(), Earning.init(), Guard.init()]);
    const invoke = async (fn, req) => {
      const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
      await fn(req, response); return response;
    };
    const agencies = require('../../TravelAgencyPannel/controllers/agencyController');
    const current = await Tour.findById(tour.id);
    const edit = await invoke(agencies.updateMyPackage, { user: { id: String(agencyId) }, params: { id: tour.id },
      body: { departures: current.departures.map(d => ({ ...d.toObject(), seatsBooked: 0 })) } });
    assert.equal(edit.statusCode, 200);
    assert.equal((await Tour.findById(tour.id)).departures[0].seatsBooked, 4);
    const deletion = await invoke(agencies.deleteMyPackage, { user: { id: String(agencyId) }, params: { id: tour.id } });
    assert.equal(deletion.statusCode, 409);
    const tours = require('../../TravelAgencyPannel/controllers/tourController');
    const search = await invoke(tours.listTours, { query: { q: '.*', limit: '2' } });
    assert.equal(search.statusCode, 200);
    assert.equal(search.body.tours.length, 0); // Regex characters are literal search text.
    await User.collection.insertOne({ _id: userId, email: 'traveller@example.invalid', username: 'traveller-test', referralCredits: 1000 });
    await Stay.collection.insertOne({ _id: 'test-stay', name: 'Test stay', price: 1000 });
    const invalid = await invoke(payments.createPayment, { user: { id: String(userId) },
      body: { accId: 'test-stay', numberOfDays: 1, useCredit: true, email: { invalid: true } } });
    assert.equal(invalid.statusCode, 500);
    assert.equal((await User.findById(userId)).referralCredits, 1000);
    const paid = await Promise.all(Array.from({ length: 3 }, () => invoke(payments.createPayment, {
      user: { id: String(userId) }, body: { accId: 'test-stay', numberOfDays: 1, useCredit: true },
    })));
    assert.ok(paid.every(r => r.statusCode === 201));
    const stays = await StayBooking.find();
    assert.equal(stays.reduce((sum, b) => sum + b.creditApplied, 0), 1000);
    assert.equal((await User.findById(userId)).referralCredits, 0);
    const bookingId = String(stays[0]._id);
    const approvals = await Promise.all([true, false].map(approved => invoke(payments.verifyPayment, { params: { id: bookingId }, body: { approved } })));
    assert.equal(approvals.filter(r => r.statusCode === 200).length, 1);
    assert.equal(approvals.filter(r => r.statusCode === 409).length, 1);
    const releaseId = String(stays[1]._id);
    await invoke(payments.verifyPayment, { params: { id: releaseId }, body: { approved: true } });
    const released = await Promise.all(Array.from({ length: 2 }, () => invoke(payments.releaseEscrow, { params: { id: releaseId } })));
    assert.ok(released.some(r => r.statusCode === 200));
    assert.ok(released.every(r => [200, 409].includes(r.statusCode)));
    const releasedAt = (await StayBooking.findById(releaseId)).releasedAt.getTime();
    await invoke(payments.releaseEscrow, { params: { id: releaseId } });
    assert.equal((await StayBooking.findById(releaseId)).releasedAt.getTime(), releasedAt);
    await Earning.collection.insertOne({ guideId: userId, amount: 10000 });
    const payouts = await Promise.all(Array.from({ length: 3 }, () => invoke(payments.requestPayout, {
      user: { id: String(userId), type: 'local guide' }, body: { amount: 7000 },
    })));
    assert.equal(payouts.filter(r => r.statusCode === 201).length, 1);
    assert.equal(await Payout.countDocuments(), 1);
  } finally { await mongoose.disconnect(); await repl.stop(); }
});
