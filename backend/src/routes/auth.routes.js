/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes
router.post('/register', registerValidation, asyncHandler(authController.register));
router.post('/login', loginValidation, asyncHandler(authController.login));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

// Protected routes
router.get('/me', authenticate, asyncHandler(authController.getProfile));
router.post('/change-password', authenticate, asyncHandler(authController.changePassword));

module.exports = router;
