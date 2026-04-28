/**
 * Global Error Handler Middleware
 * Catches and formats all errors
 */

const logger = require('../utils/logger');

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // PostgreSQL errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                error = new APIError('Duplicate entry. This record already exists.', 409);
                break;
            case '23503': // Foreign key violation
                error = new APIError('Referenced record does not exist.', 400);
                break;
            case '23502': // Not null violation
                error = new APIError('Required field is missing.', 400);
                break;
            case '22P02': // Invalid text representation
                error = new APIError('Invalid data format.', 400);
                break;
            default:
                error = new APIError('Database error occurred.', 500);
        }
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(e => e.message).join(', ');
        error = new APIError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new APIError('Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = new APIError('Token expired', 401);
    }

    // Send error response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    APIError,
    errorHandler,
    asyncHandler
};
