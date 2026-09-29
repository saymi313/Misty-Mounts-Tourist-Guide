const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');
const TourPackage = require('../UserBackend/models/tourPackage');
const TourBooking = require('../UserBackend/models/tourBooking');
const User = require('../LocalGuidePannel/models/User');
const fail = (status, message) => Object.assign(new Error(message), { status });

async function reserveTour(userId, input) {
  const n = Number(input.seats);
  if (!Number.isSafeInteger(n) || n < 1 || n > 1000) throw fail(400, 'Seats must be a whole number between 1 and 1000.');
  if (!mongoose.isValidObjectId(input.departureId)) throw fail(400, 'Please select a valid departure.');
  return mongoose.connection.transaction(async session => {
    const pkg = await TourPackage.findById(input.packageId).session(session);
    if (!pkg?.isApproved || !pkg.isPublished) throw fail(404, 'Tour not found');
    const agency = await User.findById(pkg.agencyId).select('isApproved').session(session);
    if (!agency || agency.isApproved === false) throw fail(409, 'This agency is not accepting bookings.');
    const dep = pkg.departures.id(input.departureId);
    if (!dep || dep.status !== 'open' || dep.date <= new Date()) throw fail(409, 'This departure is unavailable.');
    if (dep.seatsTotal - dep.seatsBooked < n) throw fail(409, 'Not enough seats remain on this departure.');
    dep.seatsBooked += n;
    await pkg.save({ session }); // Conflicting reservations retry the entire transaction.
    const fields = Object.fromEntries(['guestName', 'email', 'phone', 'paymentProof', 'paymentRef', 'paymentAccountLabel', 'senderName'].map(key => [key, input[key]]));
    const [booking] = await TourBooking.create([{
      ...fields, userId, agencyId: pkg.agencyId, packageId: pkg._id, packageTitle: pkg.title,
      city: pkg.cities[0] || '', image: pkg.coverImage || '', departureId: String(dep._id), departureDate: dep.date,
      seats: n, pricePerPerson: pkg.pricePerPerson, amount: n * pkg.pricePerPerson,
      ref: `MM-${randomUUID()}`, paymentStatus: 'Pending', status: 'Upcoming',
    }], { session });
    return { booking, pkg };
  });
}

async function verifyTour(id, approved) {
  return mongoose.connection.transaction(async session => {
    const booking = await TourBooking.findOneAndUpdate({ _id: id, paymentStatus: 'Pending', status: 'Upcoming' }, {
      $set: { paymentStatus: approved ? 'Approved' : 'Rejected', status: approved ? 'Upcoming' : 'Cancelled',
        escrowStatus: approved ? 'Held' : 'Refunded', ...(approved ? { heldAt: new Date() } : {}) },
    }, { new: true, session });
    if (!booking) throw fail(409, 'This booking has already changed. Refresh before trying again.');
    if (!approved) {
      const pkg = await TourPackage.findById(booking.packageId).session(session);
      const dep = pkg?.departures.id(booking.departureId);
      if (dep) {
        dep.seatsBooked = Math.max(0, dep.seatsBooked - booking.seats);
        await pkg.save({ session });
      }
    }
    return booking;
  });
}
module.exports = { reserveTour, verifyTour };
