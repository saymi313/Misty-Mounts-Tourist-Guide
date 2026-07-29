const express = require("express");
const router = express.Router();
const {
  getConversations,
  getThread,
  sendMessage,
  unreadCount,
} = require("../controllers/messageController");
const { authenticate } = require("../../middleware/auth");

// All messaging is private to the signed-in traveller / local guide.
router.use(authenticate);

router.get("/conversations", getConversations);
router.get("/unread-count", unreadCount);
router.get("/with/:partnerId", getThread);
router.post("/with/:partnerId", sendMessage);

module.exports = router;
