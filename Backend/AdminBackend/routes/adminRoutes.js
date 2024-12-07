const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const accommodationController = require("../controllers/accommodationController");

router.post("/accommodations", accommodationController.addAccommodation);
router.put("/accommodations/:id", accommodationController.updateAccommodation);
router.delete("/accommodations/:id", accommodationController.deleteAccommodation);
router.get("/accommodations", accommodationController.getAllAccommodations);
// Add a tourist spot
router.post('/spots', adminController.addTouristSpot);

// Other routes for spot management
router.put('/spots/:id', adminController.updateTouristSpot);
router.delete('/spots/:id', adminController.deleteTouristSpot);
router.get('/spots', adminController.getAllSpots);
router.patch('/spots/:id/approve', adminController.approveOrRejectSpot);

module.exports = router;
