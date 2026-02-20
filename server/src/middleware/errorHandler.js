const logger = require('../config/logger');

/**
 * Production error handling middleware.
 * Catches all errors, logs them, and sends safe responses.
 */
function errorHandler(err, req, res, next) {
    // Log the full error internally
    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id || 'anonymous',
        body: req.method !== 'GET' ? req.body : undefined,
    });

    // CSRF errors
    if (err.code === 'EBADCSRFTOKEN' || err.message?.includes('csrf')) {
        return res.status(403).json({
            message: 'Invalid or missing CSRF token. Please refresh the page.',
            code: 'CSRF_ERROR',
        });
    }

    // Validation errors (Zod)
    if (err.name === 'ZodError') {
        return res.status(400).json({
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: err.errors?.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    // Prisma errors
    if (err.code?.startsWith('P')) {
        const prismaMessages = {
            P2002: 'A record with this value already exists.',
            P2025: 'Record not found.',
            P2003: 'Related record not found.',
        };
        return res.status(err.code === 'P2025' ? 404 : 409).json({
            message: prismaMessages[err.code] || 'Database error occurred.',
            code: 'DATABASE_ERROR',
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid authentication token.',
            code: 'AUTH_ERROR',
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Authentication token has expired.',
            code: 'TOKEN_EXPIRED',
        });
    }

    // Default: send safe error in production, detailed in development
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        message: isProduction ? 'An unexpected error occurred.' : err.message,
        code: 'INTERNAL_ERROR',
        ...(isProduction ? {} : { stack: err.stack }),
    });
}

/**
 * 404 handler for unmatched routes.
 */
function notFoundHandler(req, res) {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found.`,
        code: 'NOT_FOUND',
    });
}

/**
 * Request logging middleware.
 */
function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        };

        if (res.statusCode >= 400) {
            logger.warn('Request failed', logData);
        } else {
            logger.http('Request completed', logData);
        }
    });
    next();
}

module.exports = { errorHandler, notFoundHandler, requestLogger };
