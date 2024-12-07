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
router.post("/", createNaturalDisaster); // Create a new disaster
router.get("/", getAllNaturalDisasters); // Get all disasters
router.get("/:id", getNaturalDisasterById); // Get a single disaster by ID
router.put("/:id", updateNaturalDisaster); // Update a disaster
router.delete("/:id", deleteNaturalDisaster); // Delete a disaster

module.exports = router;
