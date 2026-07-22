const express = require("express");
const router = express.Router();
const {
  getNotifications, markRead, markAllRead, remove,
} = require("../controllers/notificationController");
const { authenticate } = require("../../middleware/auth");

router.get("/", authenticate, getNotifications);
router.patch("/read-all", authenticate, markAllRead);
router.patch("/:id/read", authenticate, markRead);
router.delete("/:id", authenticate, remove);

module.exports = router;
