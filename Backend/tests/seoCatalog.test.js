const test = require('node:test');
const assert = require('node:assert/strict');
const { catalogPaths } = require('../routes/seoRoutes');
test('sitemap catalogue includes approved public records only, with escaped path segments', () => {
  const paths = catalogPaths(
    [{ city: 'Hunza Valley', isApproved: true, nearbyPlaces: [{ _id: 'lake', isApproved: true }, { _id: 'pending', isApproved: false }] }, { city: 'Hidden', isApproved: false }],
    [{ _id: 'hotel-1', isApproved: true, isAvailable: true }, { _id: 'unavailable', isApproved: true, isAvailable: false }],
    [{ _id: 'tour-1', isApproved: true, isPublished: true }, { _id: 'draft', isApproved: true, isPublished: false }],
    [{ _id: 'guide-1', type: 'local guide', isApproved: true }, { _id: 'traveler', type: 'user', isApproved: true }],
  );
  assert.deepEqual(paths, ['/destinations/Hunza%20Valley', '/city/Hunza%20Valley/spot/lake', '/accommodations/hotel-1', '/tours/tour-1', '/guides/guide-1']);
});
