const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const accommodationController = require('../controllers/accommodationController');
const transportationController = require('../controllers/TransportationController');

router.post('/accommodations', accommodationController.addAccommodation);
router.put('/accommodations/:id', accommodationController.updateAccommodation);
router.delete('/accommodations/:id', accommodationController.deleteAccommodation);
router.get('/accommodations', accommodationController.getAllAccommodations);
// Fetch approved tourist spots by city, excluding 'nearbyPlaces'
router.get('/city/approved', adminController.getApprovedSpotsByCity);

// Add a tourist spot
router.post('/spots', adminController.addTouristSpot);

// Other routes for spot management
router.put('/spots/:id', adminController.updateTouristSpot);
router.delete('/spots/:id', adminController.deleteTouristSpot);
router.get('/spots', adminController.getAllSpots);
// Update the approval route to use the correct handler
router.patch("/api/admin/spots/:id/approve",adminController.approveOrRejectSpot);
// Transportation routes
router.get('/transportation/:spotId', transportationController.getTransportationBySpotId);
router.post('/transportation', transportationController.addTransportation);
router.put('/transportation/:id', transportationController.updateTransportation);
router.delete('/transportation/:id', transportationController.deleteTransportation);

module.exports = router;
