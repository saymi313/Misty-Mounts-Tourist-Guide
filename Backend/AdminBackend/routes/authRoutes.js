const express = require("express");
const { loginAdmin } = require("../controllers/authController");

const router = express.Router();

// Admin login route
router.post("/login", loginAdmin);

module.exports = router;
