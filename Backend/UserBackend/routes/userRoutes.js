const express = require("express");
const router = express.Router();
const {
  getMe, updateMe, uploadAvatar, getSaved, addSaved, removeSaved,
} = require("../controllers/userController");
const { listGuides, getGuide } = require("../controllers/guidesController");
const { authenticate } = require("../../middleware/auth");

// In-memory upload → streamed to Cloudinary in the controller.
const { imageUpload } = require('../../middleware/imageUpload');

// Public local-guide directory
router.get("/guides", listGuides);
router.get("/guides/:id", getGuide);

router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);
router.post("/avatar", authenticate, ...imageUpload('avatar', 2 * 1024 * 1024), uploadAvatar);

// Saved spots
router.get("/saved", authenticate, getSaved);
router.post("/saved/:spotId", authenticate, addSaved);
router.delete("/saved/:spotId", authenticate, removeSaved);

module.exports = router;
