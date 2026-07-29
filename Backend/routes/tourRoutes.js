const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const tourController = require("../TravelAgencyPannel/controllers/tourController");

// Public reads
router.get("/", tourController.listTours);
// Traveller-only (must precede "/:id" so it isn't swallowed as an id)
router.get("/my-bookings", authenticate, tourController.listMyTourBookings);
router.post("/book", authenticate, tourController.bookTour);
router.get("/:id", tourController.getTour);

module.exports = router;
