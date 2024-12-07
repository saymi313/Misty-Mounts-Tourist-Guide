const Feedback = require('../models/feedback');

// Add a new feedback
const addFeedback = async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;

    const newFeedback = new Feedback({ name, email, message, rating });
    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully', data: newFeedback });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while submitting feedback' });
  }
};

// Get all feedbacks
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json({ data: feedbacks });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching feedbacks' });
  }
};

// Delete feedback by ID
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.status(200).json({ message: 'Feedback deleted successfully', data: deletedFeedback });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting feedback' });
  }
};

module.exports = {
  addFeedback,
  getAllFeedbacks,
  deleteFeedback,
};
