/**
 * Registration Routes
 */

const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { enrollmentValidation } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// All routes require student authentication
router.use(authenticate);
router.use(authorize('student'));

router.get('/available-courses', asyncHandler(registrationController.getAvailableCourses));
router.get('/my-schedule', asyncHandler(registrationController.getMySchedule));
router.post('/enroll', enrollmentValidation, asyncHandler(registrationController.enrollInCourse));
router.delete('/drop/:enrollmentId', asyncHandler(registrationController.dropCourse));
router.post('/waitlist', enrollmentValidation, asyncHandler(registrationController.joinWaitlist));

module.exports = router;
