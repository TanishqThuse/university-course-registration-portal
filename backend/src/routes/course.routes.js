/**
 * Course Routes
 */

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { courseValidation, courseOfferingValidation, idValidation, paginationValidation } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Public/authenticated routes
router.get('/', authenticate, paginationValidation, asyncHandler(courseController.getCourses));
router.get('/departments', authenticate, asyncHandler(courseController.getDepartments));
router.get('/offerings', authenticate, paginationValidation, asyncHandler(courseController.getCourseOfferings));
router.get('/:id', authenticate, idValidation, asyncHandler(courseController.getCourseById));

// Admin only routes
router.post('/', authenticate, authorize('admin'), courseValidation, asyncHandler(courseController.createCourse));
router.put('/:id', authenticate, authorize('admin'), idValidation, courseValidation, asyncHandler(courseController.updateCourse));
router.delete('/:id', authenticate, authorize('admin'), idValidation, asyncHandler(courseController.deleteCourse));
router.post('/offerings', authenticate, authorize('admin'), courseOfferingValidation, asyncHandler(courseController.createCourseOffering));

module.exports = router;
