const express = require('express');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

// POST request for user signup
router.post('/signup', signup);

// POST request for user login
router.post('/login', login);

module.exports = router;
