const express = require('express');
const {
  addFeedback,
  getFeedbacksByLocation,
  deleteFeedback,
  getAllFeedbacks
} = require('../controllers/feedbackController');

const router = express.Router();

// Route to submit feedback for a specific location
router.post('/submit', addFeedback);

// Route to fetch all feedbacks for a specific location
router.get('/:locationName', getFeedbacksByLocation);

// Route to delete feedback by ID
router.delete('/:id', deleteFeedback);

router.get('/', getAllFeedbacks);


module.exports = router;
