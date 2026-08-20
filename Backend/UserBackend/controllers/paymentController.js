// controllers/paymentController.js
const Booking = require("../models/booking");
const Payout = require("../models/payout");
const Earning = require("../models/earning");
const TourBooking = require("../models/tourBooking");
const TourPackage = require("../models/tourPackage");
const Accommodation = require("../../AdminBackend/models/Accommodation");
const User = require("../../LocalGuidePannel/models/User");
const Admin = require("../../AdminBackend/models/Admin");
const { createNotification } = require("./notificationController");
const { getRevenueConfig } = require("../../AdminBackend/controllers/settingsController");

/** Notify every admin account (admins are a separate collection). */
const notifyAdmins = async (data) => {
  try {
    const admins = await Admin.find().select("_id");
    admins.forEach((a) => createNotification(a._id, data));
  } catch { /* best-effort */ }
};

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
  creditApplied: b.creditApplied || 0,
  status: b.status,
  paymentStatus: b.paymentStatus || "Approved",
  escrowStatus: b.escrowStatus || "None",
  releasedAt: b.releasedAt || null,
  bookedOn: b.createdAt,
  ref: b.ref,
});

// POST /api/payment/create  — traveller submits a booking + payment proof (pending).
exports.createPayment = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, date, numberOfDays,
      hasPromoCode, subtotal, fee, hotelName, accId, city, hotelImage, guests,
      paymentProof, paymentRef, paymentAccountLabel, senderName,
    } = req.body;

    const nights = Math.max(1, Number(numberOfDays) || 1);
    // Price is recomputed from the authoritative Accommodation record — never
    // trusted from the client (which could send subtotal/fee = 0 to pay nothing).
    const acc = accId ? await Accommodation.findById(accId) : null;
    if (!acc) return res.status(400).json({ error: "Invalid accommodation selected" });

    // Respect the owner's availability calendar: reject if any night of the stay
    // falls on a blacked-out date.
    if (date && Array.isArray(acc.blackoutDates) && acc.blackoutDates.length) {
      const base = new Date(date);
      if (!isNaN(base)) {
        const black = new Set(acc.blackoutDates);
        for (let i = 0; i < nights; i++) {
          const key = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + i)).toISOString().slice(0, 10);
          if (black.has(key)) return res.status(400).json({ error: "Those dates aren't available for this stay. Please choose different dates." });
        }
      }
    }

    let amount = Number(acc.price) * nights;

    // Redeem referral credit (discount-only) if the traveller opted in. Applied
    // server-side against the authoritative price; the balance is decremented
    // atomically so it can't be double-spent.
    let creditApplied = 0;
    if (req.body.useCredit) {
      const me = await User.findById(req.user.id).select("referralCredits");
      const bal = Math.max(0, Number(me?.referralCredits) || 0);
      creditApplied = Math.min(bal, amount);
      if (creditApplied > 0) {
        amount -= creditApplied;
        await User.updateOne({ _id: req.user.id }, { $inc: { referralCredits: -creditApplied } });
      }
    }
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
      creditApplied,
      status: "Upcoming",
      ref,
      guestName: [firstName, lastName].filter(Boolean).join(" "),
      email: email || "",
      phone: phone || "",
      hasPromoCode: !!hasPromoCode,
      paymentProof: paymentProof || "",
      paymentRef: paymentRef || "",
      paymentAccountLabel: paymentAccountLabel || "",
      senderName: senderName || "",
      paymentStatus: "Pending",
    });

    // Traveller: payment received, pending verification.
    createNotification(req.user.id, {
      type: "booking",
      title: "Payment submitted",
      body: `We received your payment for ${booking.hotel} (ref ${ref}). It's pending verification.`,
      link: "/bookings",
    });
    // Admins: a payment awaits review.
    notifyAdmins({
      type: "booking",
      title: "New payment to verify",
      body: `${booking.guestName || "A traveller"} submitted a payment for ${booking.hotel} (ref ${ref}).`,
      link: "/admin/revenue",
    });

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

// GET /api/payment  — all payments/bookings (admin revenue table).
exports.getAllPayments = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    const rows = bookings.map((b) => ({
      _id: b._id,
      guest: b.guestName || b.email,
      email: b.email || "",
      phone: b.phone || "",
      hotel: b.hotel,
      city: b.city,
      date: b.checkIn,
      nights: b.nights,
      amount: b.amount,
      status: b.status,
      paymentStatus: b.paymentStatus || "Approved",
      escrowStatus: b.escrowStatus || "None",
      paymentProof: b.paymentProof || "",
      paymentRef: b.paymentRef || "",
      paymentAccountLabel: b.paymentAccountLabel || "",
      senderName: b.senderName || "",
      accId: b.accId || "",
      ref: b.ref,
      bookedOn: b.createdAt,
    }));
    res.json({ payments: rows });
  } catch (err) {
    console.error("getAllPayments error:", err.message);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// PATCH /api/payment/:id/verify  — admin approves/rejects a submitted payment.
exports.verifyPayment = async (req, res) => {
  try {
    const approved = !!req.body.approved;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    booking.paymentStatus = approved ? "Approved" : "Rejected";
    booking.status = approved ? "Upcoming" : "Cancelled";
    // Approval places the funds in escrow; they're released to the hotel only
    // after the traveller confirms the stay (or admin/auto-release on check-out).
    if (approved && booking.escrowStatus !== "Released") { booking.escrowStatus = "Held"; booking.heldAt = new Date(); }
    if (!approved) booking.escrowStatus = "Refunded";
    await booking.save();

    createNotification(
      booking.userId,
      approved
        ? {
            type: "booking",
            title: "Booking confirmed",
            body: `Your payment for ${booking.hotel} (ref ${booking.ref}) is verified — booking confirmed. Your money is held safely in escrow until your stay.`,
            link: "/bookings",
          }
        : {
            type: "booking",
            title: "Payment rejected",
            body: `Your payment for ${booking.hotel} (ref ${booking.ref}) couldn't be verified. Please re-submit or contact support.`,
            link: "/bookings",
          }
    );

    // On approval, notify the hotel owner (if the listing belongs to a hotel).
    if (approved && booking.accId) {
      Accommodation.findById(booking.accId).select("ownerId").then((acc) => {
        if (acc?.ownerId) {
          createNotification(acc.ownerId, {
            type: "booking",
            title: "New confirmed booking",
            body: `${booking.guestName || "A traveller"} booked ${booking.hotel} (ref ${booking.ref}).`,
            link: "/hotel/bookings",
          });
        }
      }).catch(() => {});
    }

    res.json({ booking: shapeBooking(booking) });
  } catch (err) {
    console.error("verifyPayment error:", err.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};

// GET /api/payment/tour-payments  — all tour bookings (admin revenue table).
exports.getAllTourPayments = async (req, res) => {
  try {
    const bookings = await TourBooking.find().sort({ createdAt: -1 });
    const rows = bookings.map((b) => ({
      _id: b._id,
      guest: b.guestName || b.email,
      email: b.email || "",
      phone: b.phone || "",
      packageTitle: b.packageTitle,
      city: b.city,
      departureDate: b.departureDate,
      seats: b.seats,
      amount: b.amount,
      status: b.status,
      paymentStatus: b.paymentStatus || "Pending",
      escrowStatus: b.escrowStatus || "None",
      paymentProof: b.paymentProof || "",
      paymentRef: b.paymentRef || "",
      paymentAccountLabel: b.paymentAccountLabel || "",
      senderName: b.senderName || "",
      ref: b.ref,
      bookedOn: b.createdAt,
    }));
    res.json({ payments: rows });
  } catch (err) {
    console.error("getAllTourPayments error:", err.message);
    res.status(500).json({ error: "Failed to fetch tour payments" });
  }
};

// PATCH /api/payment/tour-payments/:id/verify  — admin approves/rejects a tour payment.
exports.verifyTourPayment = async (req, res) => {
  try {
    const approved = !!req.body.approved;
    const booking = await TourBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Tour booking not found" });
    const wasPending = booking.paymentStatus === "Pending";
    booking.paymentStatus = approved ? "Approved" : "Rejected";
    booking.status = approved ? "Upcoming" : "Cancelled";
    if (approved && booking.escrowStatus !== "Released") { booking.escrowStatus = "Held"; booking.heldAt = new Date(); }
    if (!approved) booking.escrowStatus = "Refunded";
    await booking.save();

    // On rejection, release the seats reserved at booking time.
    if (!approved && wasPending) {
      const pkg = await TourPackage.findById(booking.packageId);
      const dep = pkg && pkg.departures.id(booking.departureId);
      if (dep) {
        dep.seatsBooked = Math.max(0, dep.seatsBooked - booking.seats);
        await pkg.save();
      }
    }

    createNotification(
      booking.userId,
      approved
        ? {
            type: "booking",
            title: "Tour booking confirmed",
            body: `Your payment for ${booking.packageTitle} (ref ${booking.ref}) is verified — you're booked. Your money is held safely in escrow until your trip.`,
            link: "/bookings",
          }
        : {
            type: "booking",
            title: "Tour payment rejected",
            body: `Your payment for ${booking.packageTitle} (ref ${booking.ref}) couldn't be verified. Please re-submit or contact support.`,
            link: "/bookings",
          }
    );
    // Notify the agency on approval.
    if (approved && booking.agencyId) {
      createNotification(booking.agencyId, {
        type: "booking",
        title: "New confirmed tour booking",
        body: `${booking.guestName || "A traveller"} booked ${booking.seats} seat(s) on ${booking.packageTitle}.`,
        link: "/travel-agency/bookings",
      });
    }

    res.json({ booking });
  } catch (err) {
    console.error("verifyTourPayment error:", err.message);
    res.status(500).json({ error: "Failed to verify tour payment" });
  }
};

// ── Escrow release (milestone) ───────────────────────────────────────────────
// Release held funds so they become withdrawable (computeBalance counts only
// Released). Triggered by the traveller confirming service, or by an admin.
const releaseHotel = async (booking) => {
  booking.escrowStatus = "Released";
  booking.releasedAt = new Date();
  if (booking.status === "Upcoming") booking.status = "Completed";
  await booking.save();
  if (booking.accId) {
    Accommodation.findById(booking.accId).select("ownerId").then((acc) => {
      if (acc?.ownerId) createNotification(acc.ownerId, {
        type: "system", title: "Funds released from escrow",
        body: `Escrow for ${booking.hotel} (ref ${booking.ref}) has been released to your balance.`,
        link: "/hotel/revenue",
      });
    }).catch(() => {});
  }
};

const releaseTour = async (booking) => {
  booking.escrowStatus = "Released";
  booking.releasedAt = new Date();
  if (booking.status === "Upcoming") booking.status = "Completed";
  await booking.save();
  if (booking.agencyId) createNotification(booking.agencyId, {
    type: "system", title: "Funds released from escrow",
    body: `Escrow for ${booking.packageTitle} (ref ${booking.ref}) has been released to your balance.`,
    link: "/travel-agency/revenue",
  });
};

// PATCH /api/payment/:id/confirm — traveller confirms their stay → releases escrow.
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.paymentStatus !== "Approved") return res.status(400).json({ error: "Payment isn't verified yet." });
    if (booking.escrowStatus !== "Released") await releaseHotel(booking);
    res.json({ booking: shapeBooking(booking) });
  } catch (err) {
    console.error("confirmBooking error:", err.message);
    res.status(500).json({ error: "Failed to confirm booking" });
  }
};

// PATCH /api/payment/:id/release — admin releases held escrow to the hotel.
exports.releaseEscrow = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.paymentStatus !== "Approved") return res.status(400).json({ error: "Payment isn't approved." });
    if (booking.escrowStatus !== "Released") await releaseHotel(booking);
    res.json({ booking: shapeBooking(booking) });
  } catch (err) {
    console.error("releaseEscrow error:", err.message);
    res.status(500).json({ error: "Failed to release escrow" });
  }
};

// PATCH /api/payment/tour-payments/:id/confirm — traveller confirms tour → releases escrow.
exports.confirmTourBooking = async (req, res) => {
  try {
    const booking = await TourBooking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: "Tour booking not found" });
    if (booking.paymentStatus !== "Approved") return res.status(400).json({ error: "Payment isn't verified yet." });
    if (booking.escrowStatus !== "Released") await releaseTour(booking);
    res.json({ booking });
  } catch (err) {
    console.error("confirmTourBooking error:", err.message);
    res.status(500).json({ error: "Failed to confirm tour booking" });
  }
};

// PATCH /api/payment/tour-payments/:id/release — admin releases held escrow to the agency.
exports.releaseTourEscrow = async (req, res) => {
  try {
    const booking = await TourBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Tour booking not found" });
    if (booking.paymentStatus !== "Approved") return res.status(400).json({ error: "Payment isn't approved." });
    if (booking.escrowStatus !== "Released") await releaseTour(booking);
    res.json({ booking });
  } catch (err) {
    console.error("releaseTourEscrow error:", err.message);
    res.status(500).json({ error: "Failed to release tour escrow" });
  }
};

// PUT /api/payment/approve  — admin sets a booking's stay status (legacy).
exports.updateBookingApproval = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const allowed = ["Upcoming", "Completed", "Cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
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

// ── Balance, payout requests, guide credits ──────────────────────────────────
// A booking's money is withdrawable only once its escrow is Released. Money that
// is paid (Approved) but not yet released sits in escrow ("held"). Legacy
// bookings approved before escrow existed (escrowStatus "None") are treated as
// held so nothing silently vanishes — an admin/traveller can release them.
const isReleased = (b) => b.escrowStatus === "Released";
const isHeld = (b) => b.escrowStatus === "Held" || (b.escrowStatus === "None" && b.paymentStatus === "Approved");

// Compute a partner's balance: released (withdrawable) + held (in escrow).
const computeBalance = async (userId, type) => {
  const { commissionPercent, minPayoutThreshold } = await getRevenueConfig();
  const net = (gross) => Math.round(gross * (1 - commissionPercent / 100));
  let earnings = 0; // released & net of commission — the base for withdrawals
  let held = 0;     // in escrow, not yet withdrawable

  if (type === "hotel") {
    const ids = (await Accommodation.find({ ownerId: userId }).select("_id")).map((a) => a._id);
    const bookings = (await Booking.find({ accId: { $in: ids } })).filter((b) => b.status !== "Cancelled");
    earnings = net(bookings.filter(isReleased).reduce((s, b) => s + (b.amount || 0), 0));
    held = net(bookings.filter(isHeld).reduce((s, b) => s + (b.amount || 0), 0));
  } else if (type === "local guide") {
    // Guide credits are admin-issued and immediately withdrawable (no escrow).
    const credits = await Earning.find({ guideId: userId });
    earnings = credits.reduce((s, e) => s + (e.amount || 0), 0);
  } else if (type === "travel agency") {
    const bookings = (await TourBooking.find({ agencyId: userId })).filter((b) => b.status !== "Cancelled");
    earnings = net(bookings.filter(isReleased).reduce((s, b) => s + (b.amount || 0), 0));
    held = net(bookings.filter(isHeld).reduce((s, b) => s + (b.amount || 0), 0));
  }
  const withdrawals = await Payout.find({ recipientId: userId, status: { $ne: "Rejected" } });
  const withdrawn = withdrawals.reduce((s, p) => s + (p.amount || 0), 0);
  return { earnings, held, withdrawn, available: Math.max(0, earnings - withdrawn), minPayoutThreshold, commissionPercent };
};

// GET /api/payment/balance  — the signed-in partner's withdrawable balance.
exports.getBalance = async (req, res) => {
  try {
    res.json(await computeBalance(req.user.id, req.user.type));
  } catch (err) {
    console.error("getBalance error:", err.message);
    res.status(500).json({ error: "Failed to load balance" });
  }
};

// POST /api/payment/payouts/request  — partner initiates a withdrawal request.
exports.requestPayout = async (req, res) => {
  try {
    if (!["hotel", "local guide", "travel agency"].includes(req.user.type)) {
      return res.status(403).json({ error: "This account can't request payouts" });
    }
    const amount = Number(req.body.amount) || 0;
    const { available, minPayoutThreshold } = await computeBalance(req.user.id, req.user.type);
    if (amount < minPayoutThreshold) {
      return res.status(400).json({ error: `Minimum payout is Rs ${minPayoutThreshold.toLocaleString()}.` });
    }
    if (amount > available) {
      return res.status(400).json({ error: `You can request at most Rs ${available.toLocaleString()}.` });
    }
    const user = await User.findById(req.user.id).select("name username");
    const payout = await Payout.create({
      recipientId: req.user.id,
      recipientName: user?.name || user?.username || "Partner",
      recipientType: req.user.type,
      amount,
      note: req.body.note || "",
      accountDetails: req.body.accountDetails || "",
      status: "Requested",
    });
    notifyAdmins({
      type: "system",
      title: "New payout request",
      body: `${payout.recipientName} requested Rs ${amount.toLocaleString()}.`,
      link: "/admin/revenue",
    });
    res.status(201).json({ payout });
  } catch (err) {
    console.error("requestPayout error:", err.message);
    res.status(500).json({ error: "Failed to submit payout request" });
  }
};

// PATCH /api/payment/payouts/:id/verify  — admin approves/rejects a request.
exports.verifyPayout = async (req, res) => {
  try {
    const approved = !!req.body.approved;
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ error: "Payout request not found" });
    payout.status = approved ? "Approved" : "Rejected";
    await payout.save();
    createNotification(payout.recipientId, {
      type: "system",
      title: approved ? "Payout approved" : "Payout rejected",
      body: approved
        ? `Your payout of Rs ${payout.amount.toLocaleString()} has been approved and transferred.`
        : `Your payout request of Rs ${payout.amount.toLocaleString()} was rejected.`,
      link:
        payout.recipientType === "hotel"
          ? "/hotel/revenue"
          : payout.recipientType === "travel agency"
          ? "/travel-agency/revenue"
          : "/local-guide/revenue",
    });
    res.json({ payout });
  } catch (err) {
    console.error("verifyPayout error:", err.message);
    res.status(500).json({ error: "Failed to update payout request" });
  }
};

// GET /api/payment/payouts  — all payout requests (admin).
exports.listPayouts = async (req, res) => {
  try {
    res.json({ payouts: await Payout.find().sort({ createdAt: -1 }) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load payouts" });
  }
};

// GET /api/payment/payouts/me  — the signed-in partner's payout requests.
exports.listMyPayouts = async (req, res) => {
  try {
    res.json({ payouts: await Payout.find({ recipientId: req.user.id }).sort({ createdAt: -1 }) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load payouts" });
  }
};

// POST /api/payment/earnings  — admin credits a local guide's earnings.
exports.creditGuide = async (req, res) => {
  try {
    const { guideId, amount, note } = req.body;
    if (!guideId || amount == null) return res.status(400).json({ error: "guideId and amount are required" });
    const guide = await User.findById(guideId).select("name username type");
    if (!guide || guide.type !== "local guide") {
      return res.status(400).json({ error: "Recipient must be a local guide" });
    }
    const earning = await Earning.create({
      guideId,
      guideName: guide.name || guide.username,
      amount: Number(amount) || 0,
      note: note || "",
    });
    createNotification(guideId, {
      type: "system",
      title: "Earnings credited",
      body: `Rs ${earning.amount.toLocaleString()} was added to your balance${note ? ` — ${note}` : ""}.`,
      link: "/local-guide/revenue",
    });
    res.status(201).json({ earning });
  } catch (err) {
    console.error("creditGuide error:", err.message);
    res.status(500).json({ error: "Failed to credit guide" });
  }
};

// GET /api/payment/earnings  — all guide credits (admin).
exports.listEarnings = async (req, res) => {
  try {
    res.json({ earnings: await Earning.find().sort({ createdAt: -1 }) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load earnings" });
  }
};

// GET /api/payment/earnings/me  — the signed-in guide's credits.
exports.listMyEarnings = async (req, res) => {
  try {
    res.json({ earnings: await Earning.find({ guideId: req.user.id }).sort({ createdAt: -1 }) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load earnings" });
  }
};
