// models/payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, required: true },
  numberOfDays: { type: Number, required: true },
  hasPromoCode: { type: Boolean, default: false },
  subtotal: { type: Number, required: true },
  fee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  hotelName: { type: String, required: true },
  isApproveBooking: { type: Boolean, default: false }, // Admin approves/rejects the booking
  
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
