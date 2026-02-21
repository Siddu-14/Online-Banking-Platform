const rateLimit = require('express-rate-limit');

// Strict rate limiter for login attempts — 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    message: {
        message: 'Too many login attempts. Please try again after 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes',
    },
    keyGenerator: (req) => {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global";
}
});

// General rate limiter for auth endpoints — 20 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
    },
});

// Global API rate limiter — 100 requests per minute
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests. Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED',
    },
});

module.exports = { loginLimiter, authLimiter, globalLimiter };
