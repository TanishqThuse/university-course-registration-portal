/**
 * Grade Routes
 */

const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { gradeValidation, idValidation } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Student routes
router.get('/my-grades', authenticate, authorize('student'), asyncHandler(gradeController.getMyGrades));

// Faculty routes
router.post('/', authenticate, authorize('faculty'), asyncHandler(gradeController.submitGrades));
router.get('/course/:courseOfferingId', authenticate, authorize('faculty', 'admin'), idValidation, asyncHandler(gradeController.getCourseGrades));

// Admin routes
router.post('/approve/:gradeId', authenticate, authorize('admin'), idValidation, asyncHandler(gradeController.approveGrade));
router.get('/transcript/:studentId', authenticate, authorize('admin', 'faculty'), idValidation, asyncHandler(gradeController.getTranscript));

module.exports = router;
