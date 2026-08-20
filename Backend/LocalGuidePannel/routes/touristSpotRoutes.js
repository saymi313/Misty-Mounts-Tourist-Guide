const express = require('express');
const router = express.Router();
const localGuideController = require('../controllers/touristSpotController');
const { authenticate, requireRole } = require('../../middleware/auth');

// These city-level document writes had no per-record ownership and let any
// self-registered guide overwrite/self-approve/delete ANY city's spots (IDOR +
// privilege escalation). The guide-facing spot flow is the ownership-checked,
// approval-gated /api/admin/places surface, so these writes are admin-only.
const adminOnly = [authenticate, requireRole('admin')];

// Reads (public)
router.get('/spots', localGuideController.getAllSpots);
router.get('/spots/:id', localGuideController.getSpotById);

// Tourist-spot CRUD (admin only)
router.post('/spots', adminOnly, localGuideController.addTouristSpot);
router.put('/spots/:id', adminOnly, localGuideController.updateTouristSpot);
router.delete('/spots/:id', adminOnly, localGuideController.deleteTouristSpot);

// Nearby-places management (admin only)
router.post('/spots/:spotId/nearbyPlaces', adminOnly, localGuideController.addNearbyPlace);
router.put('/spots/:spotId/nearbyPlaces/:nearbyPlaceId', adminOnly, localGuideController.updateNearbyPlace);
router.delete('/spots/:spotId/nearbyPlaces/:nearbyPlaceId', adminOnly, localGuideController.deleteNearbyPlace);

module.exports = router;
