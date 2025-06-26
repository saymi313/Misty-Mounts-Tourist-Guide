const Feedback = require('../models/Feedback');

// Add new feedback
exports.addFeedback = async (req, res) => {
  const { locationName, rating, message } = req.body;

  if (!locationName || !rating || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newFeedback = new Feedback({
      locationName,
      rating,
      message,
    });

    await newFeedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully!',
      feedback: newFeedback,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Get feedback by location name
exports.getFeedbacksByLocation = async (req, res) => {
  const { locationName } = req.params;

  try {
    const feedbacks = await Feedback.find({ locationName });

    if (feedbacks.length === 0) {
      return res.status(404).json({ message: 'No feedback found for this location' });
    }

    res.status(200).json({
      message: 'Feedbacks fetched successfully',
      feedbacks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
};

// Delete feedback by ID
exports.deleteFeedback = async (req, res) => {
  const { id } = req.params;

  try {
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json({
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();

    // Return empty array instead of 404 when no feedbacks exist
    res.status(200).json({
      message: feedbacks.length > 0 ? 'All feedbacks fetched successfully' : 'No feedbacks available',
      feedbacks: feedbacks || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch all feedbacks' });
  }
};