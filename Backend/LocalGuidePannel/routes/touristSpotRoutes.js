const express = require('express');
const router = express.Router();
const localGuideController = require('../controllers/touristSpotController');

// CRUD operations for tourist spots
router.post('/spots', localGuideController.addTouristSpot);
router.put('/spots/:id', localGuideController.updateTouristSpot);
router.delete('/spots/:id', localGuideController.deleteTouristSpot);
router.get('/spots', localGuideController.getAllSpots);
router.get('/spots/:id', localGuideController.getSpotById);

// Nearby places management
router.post('/spots/:spotId/nearbyPlaces', localGuideController.addNearbyPlace);
router.put('/spots/:spotId/nearbyPlaces/:nearbyPlaceId', localGuideController.updateNearbyPlace);
router.delete('/spots/:spotId/nearbyPlaces/:nearbyPlaceId', localGuideController.deleteNearbyPlace);

module.exports = router;
