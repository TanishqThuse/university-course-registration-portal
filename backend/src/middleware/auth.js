/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const db = require('../config/database');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const result = await db.query(
            'SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Authorization denied.'
            });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive. Please contact administrator.'
            });
        }

        // Attach user to request
        req.user = user;
        
        // Log access for audit
        await db.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                user.id,
                `${req.method} ${req.path}`,
                'api_access',
                req.ip,
                req.get('user-agent')
            ]
        );

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Authorization denied.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        logger.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

/**
 * Authorize based on user roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            logger.warn('Unauthorized access attempt', {
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: roles,
                path: req.path
            });

            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};

/**
 * Optional authentication - attaches user if token is valid but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await db.query(
            'SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
            req.user = result.rows[0];
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuth
};
