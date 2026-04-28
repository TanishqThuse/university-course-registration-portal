/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const db = require('../config/database');

// All routes require authentication
router.use(authenticate);

/**
 * Get user notifications
 * GET /api/notifications
 */
router.get('/', asyncHandler(async (req, res) => {
    const { unreadOnly = false, limit = 50 } = req.query;

    let query = `
        SELECT id, type, subject, message, is_read, created_at
        FROM notifications
        WHERE user_id = $1
    `;

    const params = [req.user.id];

    if (unreadOnly === 'true') {
        query += ' AND is_read = false';
    }

    query += ' ORDER BY created_at DESC LIMIT $2';
    params.push(limit);

    const result = await db.query(query, params);

    res.json({
        success: true,
        data: result.rows
    });
}));

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', asyncHandler(async (req, res) => {
    const { id } = req.params;

    await db.query(
        'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
    );

    res.json({
        success: true,
        message: 'Notification marked as read'
    });
}));

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
router.patch('/read-all', asyncHandler(async (req, res) => {
    await db.query(
        'UPDATE notifications SET is_read = true WHERE user_id = $1',
        [req.user.id]
    );

    res.json({
        success: true,
        message: 'All notifications marked as read'
    });
}));

module.exports = router;
