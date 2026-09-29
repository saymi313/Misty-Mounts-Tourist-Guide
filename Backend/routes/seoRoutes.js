const express = require('express');
const TouristSpot = require('../AdminBackend/models/TouristSport');
const Accommodation = require('../AdminBackend/models/Accommodation');
const Tour = require('../UserBackend/models/tourPackage');
const User = require('../LocalGuidePannel/models/User');
const router = express.Router();
const segment = value => encodeURIComponent(String(value));
function catalogPaths(cities, stays, tours, guides) {
  const paths = [];
  for (const city of cities.filter(item => item.isApproved === true)) {
    paths.push(`/destinations/${segment(city.city)}`);
    for (const spot of city.nearbyPlaces || []) if (spot.isApproved === true) paths.push(`/city/${segment(city.city)}/spot/${segment(spot._id)}`);
  }
  for (const stay of stays) if (stay.isApproved === true && stay.isAvailable === true) paths.push(`/accommodations/${segment(stay._id)}`);
  for (const tour of tours) if (tour.isApproved === true && tour.isPublished === true) paths.push(`/tours/${segment(tour._id)}`);
  for (const guide of guides) if (guide.isApproved === true && guide.type === 'local guide') paths.push(`/guides/${segment(guide._id)}`);
  return [...new Set(paths)];
}
router.get('/catalog', async (_req, res) => {
  try {
    const limit = 10001;
    const [cities, stays, tours, guides] = await Promise.all([
      TouristSpot.find({ isApproved: true }).select('city isApproved nearbyPlaces._id nearbyPlaces.isApproved').limit(limit).lean(),
      Accommodation.find({ isApproved: true, isAvailable: true }).select('_id isApproved isAvailable').limit(limit).lean(),
      Tour.find({ isApproved: true, isPublished: true }).select('_id isApproved isPublished').limit(limit).lean(),
      User.find({ type: 'local guide', isApproved: true }).select('_id type isApproved').limit(limit).lean(),
    ]);
    const paths = catalogPaths(cities, stays, tours, guides);
    if ([cities, stays, tours, guides].some(rows => rows.length >= limit) || paths.length > 10000) return res.status(503).json({ error: 'Catalogue exceeds snapshot limit. Configure paginated sitemap generation before publishing.' });
    res.set('Cache-Control', 'public, max-age=300').json({ paths });
  } catch { res.status(503).json({ error: 'Public catalogue unavailable. Retry the SEO build after the API recovers.' }); }
});
module.exports = { router, catalogPaths };
