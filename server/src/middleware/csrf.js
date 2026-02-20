const crypto = require('crypto');

const CSRF_SECRET = process.env.CSRF_SECRET || 'banking-csrf-secret-key-2024';
const CSRF_COOKIE_NAME = '__csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a CSRF token using HMAC.
 * The token = randomBytes + '.' + HMAC(randomBytes, secret)
 * This is the Double-Submit Cookie pattern.
 */
function generateCsrfToken() {
    const random = crypto.randomBytes(32).toString('hex');
    const hmac = crypto.createHmac('sha256', CSRF_SECRET).update(random).digest('hex');
    return `${random}.${hmac}`;
}

/**
 * Validate that a CSRF token is properly signed.
 */
function validateCsrfToken(token) {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [random, hmac] = parts;
    const expectedHmac = crypto.createHmac('sha256', CSRF_SECRET).update(random).digest('hex');

    // Timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'));
    } catch {
        return false;
    }
}

/**
 * Middleware: Set CSRF token cookie on GET requests.
 */
function csrfTokenEndpoint(req, res) {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,   // Frontend JS must read this
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
    });
    res.json({ csrfToken: token });
}

/**
 * Middleware: Validate CSRF token on state-changing requests.
 * Compares the token sent in the header against the one in the cookie.
 * Both must be present, valid (properly signed), and identical.
 */
function csrfProtection(req, res, next) {
    // Skip safe HTTP methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const headerToken = req.headers[CSRF_HEADER_NAME];
    const cookieToken = req.cookies[CSRF_COOKIE_NAME];

    if (!headerToken || !cookieToken) {
        return res.status(403).json({
            message: 'CSRF token missing. Please refresh the page.',
            code: 'CSRF_ERROR',
        });
    }

    // Both tokens must match (double-submit validation)
    if (headerToken !== cookieToken) {
        return res.status(403).json({
            message: 'CSRF token mismatch. Please refresh the page.',
            code: 'CSRF_ERROR',
        });
    }

    // Validate the token signature
    if (!validateCsrfToken(headerToken)) {
        return res.status(403).json({
            message: 'Invalid CSRF token. Please refresh the page.',
            code: 'CSRF_ERROR',
        });
    }

    next();
}

module.exports = { csrfTokenEndpoint, csrfProtection, generateCsrfToken };
