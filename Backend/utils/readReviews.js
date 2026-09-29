const Feedback = require('../UserBackend/models/feedback');
const { pagination } = require('./pagination');
module.exports = async function readReviews(req, res, filter) {
  try {
    const { page, limit, skip } = pagination(req.query, 20);
    const [feedbacks, summaryRows] = await Promise.all([
      Feedback.find(filter).select('-userId').sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean().maxTimeMS(5000),
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: '$locationName', count: { $sum: 1 }, ratingSum: { $sum: '$rating' }, fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } } } },
        { $group: { _id: null, total: { $sum: '$count' }, ratingSum: { $sum: '$ratingSum' }, fiveStar: { $sum: '$fiveStar' }, spots: { $sum: 1 } } },
      ]).option({ maxTimeMS: 5000 }),
    ]);
    const stats = summaryRows[0] || { total: 0, ratingSum: 0, fiveStar: 0, spots: 0 };
    res.json({ feedbacks, summary: { total: stats.total, average: stats.total ? stats.ratingSum / stats.total : 0, fiveStar: stats.fiveStar, spots: stats.spots },
      pagination: { page, limit, total: stats.total, hasMore: skip + feedbacks.length < stats.total } });
  } catch (err) { res.status(err.status === 400 ? 400 : 500).json({ error: err.status === 400 ? err.message : 'Failed to load reviews' }); }
};
