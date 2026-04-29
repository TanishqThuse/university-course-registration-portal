/**
 * Grade Routes
 * Fixed to use correct param validators (courseOfferingId, gradeId, studentId)
 * instead of generic idValidation which only validates :id
 */

const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { gradeValidation, offeringIdValidation, gradeIdValidation, studentIdValidation } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Student routes
router.get('/my-grades', authenticate, authorize('student'), asyncHandler(gradeController.getMyGrades));

// Faculty routes
router.post('/', authenticate, authorize('faculty'), asyncHandler(gradeController.submitGrades));
router.get('/course/:courseOfferingId', authenticate, authorize('faculty', 'admin'), asyncHandler(gradeController.getCourseGrades));

// Admin routes
router.post('/approve/:gradeId', authenticate, authorize('admin'), asyncHandler(gradeController.approveGrade));
router.get('/transcript/:studentId', authenticate, authorize('admin', 'faculty'), asyncHandler(gradeController.getTranscript));

module.exports = router;
