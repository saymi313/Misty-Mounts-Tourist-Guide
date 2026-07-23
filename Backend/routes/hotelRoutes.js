const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth");
const hotelController = require("../HotelPannel/controllers/hotelController");

// Every hotel-panel route is gated to signed-in hotel accounts.
const hotelOnly = [authenticate, requireRole("hotel")];

router.get("/accommodations", hotelOnly, hotelController.listMyAccommodations);
router.post("/accommodations", hotelOnly, hotelController.createMyAccommodation);
router.put("/accommodations/:id", hotelOnly, hotelController.updateMyAccommodation);
router.delete("/accommodations/:id", hotelOnly, hotelController.deleteMyAccommodation);
router.get("/bookings", hotelOnly, hotelController.listMyBookings);

module.exports = router;
