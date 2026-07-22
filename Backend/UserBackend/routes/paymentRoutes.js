// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPayment, getMyBookings, cancelBooking, getAllPayments, updateBookingApproval,
} = require('../controllers/paymentController');
const { authenticate, requireAdmin } = require('../../middleware/auth');

// Create a booking (signed-in user)
router.post('/create', authenticate, createPayment);

// The signed-in user's own bookings
router.get('/me', authenticate, getMyBookings);
router.patch('/:id/cancel', authenticate, cancelBooking);

// Admin views/updates
router.get('/', authenticate, requireAdmin, getAllPayments);
router.put('/approve', authenticate, requireAdmin, updateBookingApproval);

module.exports = router;
