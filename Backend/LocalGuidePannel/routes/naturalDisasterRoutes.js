const express = require("express");
const router = express.Router();
const {
  createNaturalDisaster,
  getAllNaturalDisasters,
  getNaturalDisasterById,
  updateNaturalDisaster,
  deleteNaturalDisaster,
} = require("../controllers/naturalDisasterController");
const { authenticate, requireRole } = require("../../middleware/auth");

const guideOrAdmin = [authenticate, requireRole("local guide", "admin")];

// Reads (public — travellers see safety alerts)
router.get("/get-disaster", getAllNaturalDisasters);
router.get("/:id", getNaturalDisasterById);

// Writes (guide/admin only)
router.post("/add-disaster", guideOrAdmin, createNaturalDisaster);
router.put("/:id", guideOrAdmin, updateNaturalDisaster);
router.delete("/:id", guideOrAdmin, deleteNaturalDisaster);

module.exports = router;
