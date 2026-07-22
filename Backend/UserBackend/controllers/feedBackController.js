const Feedback = require('../models/feedback');
const User = require('../../LocalGuidePannel/models/User');

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

    // Return 200 with an empty array when a location simply has no reviews yet.
    res.status(200).json({
      message: feedbacks.length ? 'Feedbacks fetched successfully' : 'No feedback yet for this location',
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

// GET /api/feedback/guide/:guideId — reviews for a local guide (public).
exports.getGuideFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ guideId: req.params.guideId }).sort({ createdAt: -1 });
    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error('getGuideFeedbacks error:', error.message);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
};

// POST /api/feedback/guide/:guideId — a signed-in traveller reviews a guide.
exports.addGuideFeedback = async (req, res) => {
  const { guideId } = req.params;
  const { rating, message } = req.body;
  if (!rating || !message) {
    return res.status(400).json({ error: 'Rating and message are required' });
  }
  try {
    const me = await User.findById(req.user.id).select('name username avatar');
    const feedback = await Feedback.create({
      guideId,
      locationName: `guide:${guideId}`,
      rating: Number(rating),
      message,
      name: me?.name || me?.username || 'Traveller',
      avatar: me?.avatar || '',
      date: new Date().toISOString().slice(0, 10),
    });
    res.status(201).json({ message: 'Feedback submitted successfully!', feedback });
  } catch (error) {
    console.error('addGuideFeedback error:', error.message);
    res.status(500).json({ error: 'Failed to submit feedback' });
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