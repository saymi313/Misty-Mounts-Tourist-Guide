const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth");
const agencyController = require("../TravelAgencyPannel/controllers/agencyController");

const agencyOnly = [authenticate, requireRole("travel agency")];

router.get("/packages", agencyOnly, agencyController.listMyPackages);
router.post("/packages", agencyOnly, agencyController.createMyPackage);
router.put("/packages/:id", agencyOnly, agencyController.updateMyPackage);
router.delete("/packages/:id", agencyOnly, agencyController.deleteMyPackage);
router.get("/bookings", agencyOnly, agencyController.listMyTourBookings);

module.exports = router;
