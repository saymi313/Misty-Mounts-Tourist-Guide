const express = require("express");
const router = express.Router();
const {
  createNaturalDisaster,
  getAllNaturalDisasters,
  getNaturalDisasterById,
  updateNaturalDisaster,
  deleteNaturalDisaster,
} = require("../controllers/naturalDisasterController");

// Routes for natural disaster management
router.post("/add-disaster", createNaturalDisaster); // Create a new disaster
router.get("/get-disaster", getAllNaturalDisasters); // Get all disasters
router.get("/:id", getNaturalDisasterById); // Get a single disaster by ID
router.put("/:id", updateNaturalDisaster); // Update a disaster
router.delete("/:id", deleteNaturalDisaster); // Delete a disaster

module.exports = router;