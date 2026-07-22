const express = require('express');
const {
  addFeedback,
  getFeedbacksByLocation,
  deleteFeedback,
  getAllFeedbacks
} = require('../controllers/feedBackController');
const { authenticate, requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// Reads (public)
router.get('/', getAllFeedbacks);
router.get('/:locationName', getFeedbacksByLocation);

// Submit a review (any signed-in user)
router.post('/submit', authenticate, addFeedback);

// Delete a review (admin only)
router.delete('/:id', authenticate, requireAdmin, deleteFeedback);

module.exports = router;
