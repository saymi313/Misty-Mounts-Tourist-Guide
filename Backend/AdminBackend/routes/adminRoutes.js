const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const accommodationController = require('../controllers/accommodationController');
const transportationController = require('../controllers/TransportationController');
const placesController = require('../controllers/placesController');
const usersController = require('../controllers/usersController');
const settingsController = require('../controllers/settingsController');
const cityController = require('../controllers/cityController');
const { authenticate, requireAdmin, requireRole } = require('../../middleware/auth');

const adminOnly = [authenticate, requireAdmin];
const staffOnly = [authenticate, requireRole('admin', 'local guide')];

// ── Platform settings (admin only) ────────────────────────────────────────────
router.get('/settings', adminOnly, settingsController.getSettings);
router.patch('/settings', adminOnly, settingsController.updateSettings);

// ── Cities (reads public — dropdowns + traveller panel; writes admin-only) ────
router.get('/cities', cityController.listCities);
router.post('/cities', adminOnly, cityController.createCity);
router.put('/cities/:id', adminOnly, cityController.updateCity);
router.delete('/cities/:id', adminOnly, cityController.deleteCity);

// ── Users & guides management (admin only) ────────────────────────────────────
router.get('/users', adminOnly, usersController.listUsers);
router.get('/users/:id', adminOnly, usersController.getUser);
router.delete('/users/:id', adminOnly, usersController.deleteUser);

// ── Accommodations (reads public, writes admin-only) ──────────────────────────
router.get('/accommodations', accommodationController.getAllAccommodations);
router.get('/accommodations/:id', accommodationController.getAccommodationById);
router.post('/accommodations', adminOnly, accommodationController.addAccommodation);
router.put('/accommodations/:id', adminOnly, accommodationController.updateAccommodation);
router.delete('/accommodations/:id', adminOnly, accommodationController.deleteAccommodation);

// ── Tourist spots ─────────────────────────────────────────────────────────────
router.get('/city/approved', adminController.getApprovedSpotsByCity);
router.get('/cities', adminController.getAllCities);
router.get('/spots', adminController.getAllSpots);
router.get('/spots/:city', adminController.getSpotsByCity);
router.post('/spots', adminOnly, adminController.addTouristSpot);
router.put('/spots/:id', adminOnly, adminController.updateTouristSpot);
router.delete('/spots/:id', adminOnly, adminController.deleteTouristSpot);
router.patch('/spots/:id/approve', adminOnly, adminController.approveOrRejectSpot);

// ── Flat places (admin/guide spot lists — bridges the city→nearbyPlaces model) ─
router.get('/places', placesController.getAllPlaces);
router.post('/places', staffOnly, placesController.createPlace);
router.put('/places/:id', staffOnly, placesController.updatePlace);
router.patch('/places/:id/approve', adminOnly, placesController.approvePlace);
router.delete('/places/:id', staffOnly, placesController.deletePlace);

// ── Transportation ────────────────────────────────────────────────────────────
router.get('/transportation', transportationController.getAllTransportation);
router.get('/transportation/:spotId', transportationController.getTransportationBySpotId);
router.post('/transportation', staffOnly, transportationController.addTransportation);
router.put('/transportation/:id', staffOnly, transportationController.updateTransportation);
router.delete('/transportation/:id', staffOnly, transportationController.deleteTransportation);

module.exports = router;
