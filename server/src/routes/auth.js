const express = require('express');
const { register, login, verifyOtp, refreshAccessToken, logout } = require('../controllers/authController');
const { loginLimiter, authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Rate-limited auth endpoints
router.post('/register', authLimiter, register);
router.post('/login', loginLimiter, login);          // Strict: 5 attempts / 15 min
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/refresh', authLimiter, refreshAccessToken);
router.post('/logout', logout);

module.exports = router;
