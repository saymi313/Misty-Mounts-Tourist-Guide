// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createPayment, getAllPayments, updateBookingApproval } = require('../controllers/paymentController');

// Route to create a payment
router.post('/create', createPayment);

// Route to get all payments (admin view)
router.get('/', getAllPayments);

// Route to update booking approval status by admin
router.put('/approve', updateBookingApproval);

module.exports = router;
