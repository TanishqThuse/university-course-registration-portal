/**
 * Authentication Controller
 * Handles user authentication, registration, and password management
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const logger = require('../utils/logger');
const { sendPasswordResetEmail } = require('../utils/email');
const { APIError } = require('../middleware/errorHandler');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

/**
 * Register new student
 * POST /api/auth/register
 */
const register = async (req, res) => {
    const { email, password, firstName, lastName, studentId, departmentId, enrollmentYear } = req.body;

    try {
        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            throw new APIError('Email already registered', 409);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Start transaction
        const result = await db.transaction(async (client) => {
            // Create user
            const userResult = await client.query(
                `INSERT INTO users (email, password_hash, role, first_name, last_name)
                 VALUES ($1, $2, 'student', $3, $4)
                 RETURNING id, email, role, first_name, last_name`,
                [email, passwordHash, firstName, lastName]
            );

            const user = userResult.rows[0];

            // Create student record
            const studentResult = await client.query(
                `INSERT INTO students (user_id, student_id, department_id, enrollment_year)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, student_id`,
                [user.id, studentId, departmentId, enrollmentYear || new Date().getFullYear()]
            );

            return {
                ...user,
                studentInfo: studentResult.rows[0]
            };
        });

        // Generate token
        const token = generateToken(result.id);

        logger.info('New student registered', { userId: result.id, email });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: result,
                token
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        throw error;
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Get user with password hash
        const result = await db.query(
            `SELECT u.id, u.email, u.password_hash, u.role, u.first_name, u.last_name, u.is_active,
                    s.id as student_id, s.student_id as student_number,
                    f.id as faculty_id, f.faculty_id as faculty_number
             FROM users u
             LEFT JOIN students s ON u.id = s.user_id
             LEFT JOIN faculty f ON u.id = f.user_id
             WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            throw new APIError('Invalid email or password', 401);
        }

        const user = result.rows[0];

        // Check if account is active
        if (!user.is_active) {
            throw new APIError('Account is inactive. Please contact administrator.', 403);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            // Log failed attempt
            await db.query(
                `INSERT INTO audit_logs (user_id, action, entity_type, ip_address)
                 VALUES ($1, 'failed_login', 'authentication', $2)`,
                [user.id, req.ip]
            );

            throw new APIError('Invalid email or password', 401);
        }

        // Update last login
        await db.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Log successful login
        await db.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, ip_address, user_agent)
             VALUES ($1, 'login', 'authentication', $2, $3)`,
            [user.id, req.ip, req.get('user-agent')]
        );

        // Generate token
        const token = generateToken(user.id);

        // Remove password hash from response
        delete user.password_hash;

        logger.info('User logged in', { userId: user.id, email });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        throw error;
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.last_login,
                    s.student_id, s.department_id as student_dept, s.current_semester, 
                    s.cumulative_gpa, s.total_credits_completed, s.academic_standing,
                    f.faculty_id, f.department_id as faculty_dept, f.designation, f.specialization,
                    d.name as department_name, d.code as department_code
             FROM users u
             LEFT JOIN students s ON u.id = s.user_id
             LEFT JOIN faculty f ON u.id = f.user_id
             LEFT JOIN departments d ON COALESCE(s.department_id, f.department_id) = d.id
             WHERE u.id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            throw new APIError('User not found', 404);
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        throw error;
    }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await db.query(
            'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent'
            });
        }

        const user = result.rows[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        // Save reset token
        await db.query(
            `UPDATE users 
             SET password_reset_token = $1, password_reset_expires = $2
             WHERE id = $3`,
            [resetTokenHash, resetExpires, user.id]
        );

        // Send email
        await sendPasswordResetEmail(user, resetToken);

        logger.info('Password reset requested', { userId: user.id, email });

        res.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent'
        });
    } catch (error) {
        logger.error('Forgot password error:', error);
        throw error;
    }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Hash the token to compare with database
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const result = await db.query(
            `SELECT id FROM users 
             WHERE password_reset_token = $1 
             AND password_reset_expires > CURRENT_TIMESTAMP`,
            [resetTokenHash]
        );

        if (result.rows.length === 0) {
            throw new APIError('Invalid or expired reset token', 400);
        }

        const userId = result.rows[0].id;

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await db.query(
            `UPDATE users 
             SET password_hash = $1, 
                 password_reset_token = NULL, 
                 password_reset_expires = NULL
             WHERE id = $2`,
            [passwordHash, userId]
        );

        logger.info('Password reset successful', { userId });

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (error) {
        logger.error('Reset password error:', error);
        throw error;
    }
};

/**
 * Change password (authenticated user)
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Get current password hash
        const result = await db.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.id]
        );

        const user = result.rows[0];

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isPasswordValid) {
            throw new APIError('Current password is incorrect', 401);
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [passwordHash, req.user.id]
        );

        logger.info('Password changed', { userId: req.user.id });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        logger.error('Change password error:', error);
        throw error;
    }
};

module.exports = {
    register,
    login,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword
};
