const express = require("express");
const { authenticateUser } = require("../middleware/auth"); 
const {
  createTouristSpot,
  getAllTouristSpots,
  getTouristSpotById,
  updateTouristSpot,
  deleteTouristSpot,
} = require("../controllers/touristSpotController");

const router = express.Router();

router.post("/", createTouristSpot); // Create a spot
router.get("/",  getAllTouristSpots); // Get all spots
router.get("/:id", getTouristSpotById); // Get a spot by ID
router.put("/:id",  updateTouristSpot); // Update a spot
router.delete("/:id",  deleteTouristSpot); // Delete a spot

module.exports = router;
