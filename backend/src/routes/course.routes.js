/**
 * Course Routes
 */

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { courseValidation, courseOfferingValidation, idValidation, paginationValidation } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes (no auth needed)
router.get('/departments', asyncHandler(courseController.getDepartments));

// Public/authenticated routes
router.get('/', authenticate, paginationValidation, asyncHandler(courseController.getCourses));

// Named sub-routes BEFORE /:id to prevent "offerings" being treated as an ID param
router.get('/offerings', authenticate, paginationValidation, asyncHandler(courseController.getCourseOfferings));
router.post('/offerings', authenticate, authorize('admin'), courseOfferingValidation, asyncHandler(courseController.createCourseOffering));

// Routes with :id param (MUST come after all specific named routes)
router.get('/:id', authenticate, idValidation, asyncHandler(courseController.getCourseById));

// Admin only routes
router.post('/', authenticate, authorize('admin'), courseValidation, asyncHandler(courseController.createCourse));
router.put('/:id', authenticate, authorize('admin'), idValidation, courseValidation, asyncHandler(courseController.updateCourse));
router.delete('/:id', authenticate, authorize('admin'), idValidation, asyncHandler(courseController.deleteCourse));

module.exports = router;
