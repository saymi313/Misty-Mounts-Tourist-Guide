// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPayment, getMyBookings, cancelBooking, getAllPayments, updateBookingApproval,
  verifyPayment, getBalance, requestPayout, listPayouts, listMyPayouts, verifyPayout,
  creditGuide, listEarnings, listMyEarnings,
} = require('../controllers/paymentController');
const { getPublicPaymentInfo } = require('../../AdminBackend/controllers/settingsController');
const { authenticate, requireAdmin } = require('../../middleware/auth');

// Public: accounts the traveller pays into at checkout.
router.get('/accounts', getPublicPaymentInfo);

// Traveller
router.post('/create', authenticate, createPayment);
router.get('/me', authenticate, getMyBookings);
router.patch('/:id/cancel', authenticate, cancelBooking);

// Partner (hotel / local guide): balance, payout requests, own earnings
router.get('/balance', authenticate, getBalance);
router.get('/payouts/me', authenticate, listMyPayouts);
router.post('/payouts/request', authenticate, requestPayout);
router.get('/earnings/me', authenticate, listMyEarnings);

// Admin
router.get('/', authenticate, requireAdmin, getAllPayments);
router.put('/approve', authenticate, requireAdmin, updateBookingApproval);
router.patch('/:id/verify', authenticate, requireAdmin, verifyPayment);
router.get('/payouts', authenticate, requireAdmin, listPayouts);
router.patch('/payouts/:id/verify', authenticate, requireAdmin, verifyPayout);
router.get('/earnings', authenticate, requireAdmin, listEarnings);
router.post('/earnings', authenticate, requireAdmin, creditGuide);

module.exports = router;
