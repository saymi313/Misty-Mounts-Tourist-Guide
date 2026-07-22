const express = require('express');
const router = express.Router();
const localGuideController = require('../controllers/touristSpotController');
const { authenticate, requireRole } = require('../../middleware/auth');

const guideOrAdmin = [authenticate, requireRole('local guide', 'admin')];

// Reads (public)
router.get('/spots', localGuideController.getAllSpots);
router.get('/spots/:id', localGuideController.getSpotById);

// Tourist-spot CRUD (guide/admin only)
router.post('/spots', guideOrAdmin, localGuideController.addTouristSpot);
router.put('/spots/:id', guideOrAdmin, localGuideController.updateTouristSpot);
router.delete('/spots/:id', guideOrAdmin, localGuideController.deleteTouristSpot);

// Nearby-places management (guide/admin only)
router.post('/spots/:spotId/nearbyPlaces', guideOrAdmin, localGuideController.addNearbyPlace);
router.put('/spots/:spotId/nearbyPlaces/:nearbyPlaceId', guideOrAdmin, localGuideController.updateNearbyPlace);
router.delete('/spots/:spotId/nearbyPlaces/:nearbyPlaceId', guideOrAdmin, localGuideController.deleteNearbyPlace);

module.exports = router;
