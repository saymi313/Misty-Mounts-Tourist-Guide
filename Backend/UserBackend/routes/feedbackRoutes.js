const express = require('express');
const {
  addFeedback,
  getAllFeedbacks,
  deleteFeedback,
} = require('../controllers/feedBackController');

const router = express.Router();

// Route to submit feedback
router.post('/submit', addFeedback);

// Route to fetch all feedbacks
router.get('/', getAllFeedbacks);

// Route to delete feedback by ID
router.delete('/:id', deleteFeedback);

module.exports = router;
