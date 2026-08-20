const express = require("express");
const { loginAdmin } = require("../controllers/authController");

const router = express.Router();

// NOTE: public admin self-registration was removed for security. Admins are
// provisioned server-side only (via `npm run seed` using ADMIN_* env vars).
router.post("/login", loginAdmin);

module.exports = router;
