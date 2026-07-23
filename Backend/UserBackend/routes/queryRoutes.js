const express = require("express");
const router = express.Router();
const { createQuery, listQueries, markRead, deleteQuery } = require("../controllers/queryController");
const { authenticate, requireAdmin } = require("../../middleware/auth");

const adminOnly = [authenticate, requireAdmin];

router.post("/", createQuery); // public — contact form
router.get("/", adminOnly, listQueries);
router.patch("/:id/read", adminOnly, markRead);
router.delete("/:id", adminOnly, deleteQuery);

module.exports = router;
