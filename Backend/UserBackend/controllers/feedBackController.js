const Feedback = require('../models/feedback');
const User = require('../../LocalGuidePannel/models/User');
const Booking = require('../models/booking');
const TourBooking = require('../models/tourBooking');

/**
 * Does this traveller have an approved (non-cancelled) booking for the subject?
 * Used to mark reviews as "Verified booking". Matches an accommodation by accId,
 * a tour by packageId, or falls back to a hotel-name match.
 */
async function hasVerifiedBooking(userId, { accId, packageId, locationName }) {
  try {
    if (accId) {
      if (await Booking.exists({ userId, accId, paymentStatus: 'Approved', status: { $ne: 'Cancelled' } })) return true;
    }
    if (packageId) {
      if (await TourBooking.exists({ userId, packageId, paymentStatus: 'Approved', status: { $ne: 'Cancelled' } })) return true;
    }
    if (!accId && locationName) {
      if (await Booking.exists({ userId, hotel: locationName, paymentStatus: 'Approved', status: { $ne: 'Cancelled' } })) return true;
    }
  } catch { /* verification is best-effort */ }
  return false;
}

// Add new feedback (general spot/trip review by a signed-in traveller).
exports.addFeedback = async (req, res) => {
  const { locationName, rating, message, accId = '', packageId = '' } = req.body;

  if (!locationName || !rating || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Capture the reviewer's identity so the review can be shown with a name +
    // avatar on the feedback page and the landing page.
    const me = await User.findById(req.user.id).select('name username avatar');
    const verifiedBooking = await hasVerifiedBooking(req.user.id, { accId, packageId, locationName });
    const newFeedback = new Feedback({
      locationName,
      userId: req.user.id,
      accId,
      packageId,
      verifiedBooking,
      rating: Number(rating),
      message,
      name: me?.name || me?.username || 'Traveller',
      avatar: me?.avatar || '',
      date: new Date().toISOString().slice(0, 10),
      photo: req.body.photo || '',
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
      userId: req.user.id,
      locationName: `guide:${guideId}`,
      rating: Number(rating),
      message,
      name: me?.name || me?.username || 'Traveller',
      avatar: me?.avatar || '',
      date: new Date().toISOString().slice(0, 10),
      photo: req.body.photo || '',
    });
    res.status(201).json({ message: 'Feedback submitted successfully!', feedback });
  } catch (error) {
    console.error('addGuideFeedback error:', error.message);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

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