/**
 * Input Validation Middleware
 * Uses express-validator for request validation
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate request and return errors if any
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    next();
};

// ============================================
// VALIDATION RULES
// ============================================

/**
 * User registration validation
 */
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 100 })
        .withMessage('First name must not exceed 100 characters'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 100 })
        .withMessage('Last name must not exceed 100 characters'),
    body('studentId')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Student ID must not exceed 20 characters'),
    validate
];

/**
 * Login validation
 */
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate
];

/**
 * Course creation validation
 */
const courseValidation = [
    body('courseCode')
        .trim()
        .notEmpty()
        .withMessage('Course code is required')
        .isLength({ max: 20 })
        .withMessage('Course code must not exceed 20 characters'),
    body('courseName')
        .trim()
        .notEmpty()
        .withMessage('Course name is required')
        .isLength({ max: 200 })
        .withMessage('Course name must not exceed 200 characters'),
    body('credits')
        .isInt({ min: 1, max: 6 })
        .withMessage('Credits must be between 1 and 6'),
    body('departmentId')
        .isInt()
        .withMessage('Department ID must be a valid integer'),
    body('description')
        .optional()
        .trim(),
    body('courseLevel')
        .isIn(['undergraduate', 'graduate'])
        .withMessage('Course level must be either undergraduate or graduate'),
    validate
];

/**
 * Course offering validation
 */
const courseOfferingValidation = [
    body('courseId')
        .isInt()
        .withMessage('Course ID must be a valid integer'),
    body('facultyId')
        .optional()
        .isInt()
        .withMessage('Faculty ID must be a valid integer'),
    body('semester')
        .isIn(['Spring', 'Summer', 'Fall', 'Winter'])
        .withMessage('Semester must be Spring, Summer, Fall, or Winter'),
    body('academicYear')
        .isInt({ min: 2020, max: 2100 })
        .withMessage('Academic year must be a valid year'),
    body('section')
        .trim()
        .notEmpty()
        .withMessage('Section is required'),
    body('maxCapacity')
        .isInt({ min: 1 })
        .withMessage('Max capacity must be at least 1'),
    body('roomNumber')
        .optional()
        .trim(),
    body('scheduleDays')
        .optional()
        .trim(),
    body('startTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    body('endTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    validate
];

/**
 * Enrollment validation
 */
const enrollmentValidation = [
    body('courseOfferingId')
        .isInt()
        .withMessage('Course offering ID must be a valid integer'),
    validate
];

/**
 * Grade submission validation
 */
const gradeValidation = [
    body('enrollmentId')
        .isInt()
        .withMessage('Enrollment ID must be a valid integer'),
    body('letterGrade')
        .isIn(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'P', 'NP', 'W', 'I'])
        .withMessage('Invalid letter grade'),
    body('percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Percentage must be between 0 and 100'),
    body('comments')
        .optional()
        .trim(),
    validate
];

/**
 * ID parameter validation
 */
const idValidation = [
    param('id')
        .isInt()
        .withMessage('ID must be a valid integer'),
    validate
];

/**
 * Pagination validation
 */
const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    courseValidation,
    courseOfferingValidation,
    enrollmentValidation,
    gradeValidation,
    idValidation,
    paginationValidation
};
