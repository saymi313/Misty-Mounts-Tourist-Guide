// controllers/paymentController.js
const Booking = require("../models/booking");
const { createNotification } = require("./notificationController");

/** Shape a booking for the traveller's "My bookings" page. */
const shapeBooking = (b) => ({
  _id: b._id,
  accId: b.accId || "",
  hotel: b.hotel,
  city: b.city || "",
  image: b.image || "",
  checkIn: b.checkIn,
  nights: b.nights,
  guests: b.guests,
  amount: b.amount,
  status: b.status,
  bookedOn: b.createdAt,
  ref: b.ref,
});

// POST /api/payment/create  — create a booking for the signed-in user.
exports.createPayment = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, date, numberOfDays,
      hasPromoCode, subtotal, fee, hotelName, accId, city, hotelImage, guests,
    } = req.body;

    const nights = Math.max(1, Number(numberOfDays) || 1);
    const sub = Number(subtotal) || 0;
    const feeNum = Number(fee) || 0;
    const amount = sub * nights + feeNum; // matches the frontend total calc
    const ref = `MM-${Date.now().toString(36).toUpperCase()}`;

    const booking = await Booking.create({
      userId: req.user.id,
      accId: accId || "",
      hotel: hotelName || "Your stay",
      city: city || "",
      image: hotelImage || "",
      checkIn: date || undefined,
      nights,
      guests: Math.max(1, Number(guests) || 1),
      amount,
      status: "Upcoming",
      ref,
      guestName: [firstName, lastName].filter(Boolean).join(" "),
      email: email || "",
      phone: phone || "",
      hasPromoCode: !!hasPromoCode,
    });

    // Fire a "booking confirmed" notification (best-effort, non-blocking).
    createNotification(req.user.id, {
      type: "booking",
      title: "Booking confirmed",
      body: `Your stay at ${booking.hotel} is confirmed. Reference ${ref}.`,
      link: "/bookings",
    });

    // Frontend reads res.data.bookingId
    res.status(201).json({ success: true, bookingId: ref, booking: shapeBooking(booking) });
  } catch (err) {
    console.error("createPayment error:", err.message);
    res.status(500).json({ error: "Error creating booking" });
  }
};

// GET /api/payment/me  — the signed-in user's bookings.
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ bookings: bookings.map(shapeBooking) });
  } catch (err) {
    console.error("getMyBookings error:", err.message);
    res.status(500).json({ error: "Failed to load bookings" });
  }
};

// PATCH /api/payment/:id/cancel  — user cancels their own booking.
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    booking.status = "Cancelled";
    await booking.save();
    res.json({ booking: shapeBooking(booking) });
  } catch (err) {
    console.error("cancelBooking error:", err.message);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

// GET /api/payment  — all bookings (admin table).
exports.getAllPayments = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    const rows = bookings.map((b) => ({
      _id: b._id,
      guest: b.guestName || b.email,
      hotel: b.hotel,
      city: b.city,
      date: b.checkIn,
      nights: b.nights,
      amount: b.amount,
      status: b.status,
    }));
    res.json({ payments: rows });
  } catch (err) {
    console.error("getAllPayments error:", err.message);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// PUT /api/payment/approve  — admin sets a booking's status.
exports.updateBookingApproval = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const allowed = ["Upcoming", "Completed", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Let the traveller know their booking status changed (best-effort).
    if (booking.userId) {
      createNotification(booking.userId, {
        type: "booking",
        title: `Booking ${status.toLowerCase()}`,
        body: `Your stay at ${booking.hotel} (ref ${booking.ref}) is now ${status.toLowerCase()}.`,
        link: "/bookings",
      });
    }

    res.json({ booking: shapeBooking(booking) });
  } catch (err) {
    console.error("updateBookingApproval error:", err.message);
    res.status(500).json({ error: "Failed to update booking" });
  }
};
