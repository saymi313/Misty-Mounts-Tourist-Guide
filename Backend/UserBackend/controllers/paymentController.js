// controllers/paymentController.js
const Payment = require('../models/payment');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { fullName, firstName, lastName, email, phone, date, numberOfDays, hasPromoCode, subtotal, fee, hotelName } = req.body;

    const totalAmount = subtotal + fee;

    const newPayment = new Payment({
     
      firstName,
      lastName,
      email,
      phone,
      date,
      numberOfDays,
      hasPromoCode,
      subtotal,
      fee,
      totalAmount,
      hotelName,
    });

    await newPayment.save();
    res.status(201).json({ message: "Payment created successfully", payment: newPayment });
  } catch (err) {
    res.status(500).json({ message: "Error creating payment", error: err.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json({ payments });
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments", error: err.message });
  }
};

// Approve or reject booking by admin
exports.updateBookingApproval = async (req, res) => {
  try {
    const { paymentId, isApproveBooking } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.isApproveBooking = isApproveBooking;
    await payment.save();

    res.status(200).json({ message: "Booking approval status updated", payment });
  } catch (err) {
    res.status(500).json({ message: "Error updating approval status", error: err.message });
  }
};
