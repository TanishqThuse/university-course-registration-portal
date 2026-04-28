/**
 * User Management Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const db = require('../config/database');

// All routes require authentication
router.use(authenticate);

/**
 * Get all users (Admin only)
 * GET /api/users
 */
router.get('/', authorize('admin'), asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, role, first_name, last_name, is_active, last_login, created_at FROM users';
    const params = [];
    let paramCount = 1;

    if (role) {
        query += ` WHERE role = $${paramCount}`;
        params.push(role);
        paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
        success: true,
        data: result.rows
    });
}));

/**
 * Update user status (Admin only)
 * PATCH /api/users/:id/status
 */
router.patch('/:id/status', authorize('admin'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    await db.query(
        'UPDATE users SET is_active = $1 WHERE id = $2',
        [isActive, id]
    );

    res.json({
        success: true,
        message: 'User status updated successfully'
    });
}));

module.exports = router;
