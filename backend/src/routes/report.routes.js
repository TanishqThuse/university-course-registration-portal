/**
 * Report Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const db = require('../config/database');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

/**
 * Get enrollment statistics
 * GET /api/reports/enrollment
 */
router.get('/enrollment', asyncHandler(async (req, res) => {
    const { semester, academicYear } = req.query;

    let query = `
        SELECT d.name as department, c.course_code, c.course_name,
               co.section, co.max_capacity, co.current_enrollment,
               co.max_capacity - co.current_enrollment as available_seats,
               ROUND((co.current_enrollment::numeric / co.max_capacity) * 100, 2) as utilization_percent
        FROM course_offerings co
        JOIN courses c ON co.course_id = c.id
        LEFT JOIN departments d ON c.department_id = d.id
        WHERE co.status = 'active'
    `;

    const params = [];
    let paramCount = 1;

    if (semester) {
        query += ` AND co.semester = $${paramCount}`;
        params.push(semester);
        paramCount++;
    }

    if (academicYear) {
        query += ` AND co.academic_year = $${paramCount}`;
        params.push(academicYear);
        paramCount++;
    }

    query += ' ORDER BY d.name, c.course_code, co.section';

    const result = await db.query(query, params);

    res.json({
        success: true,
        data: result.rows
    });
}));

/**
 * Get grade distribution
 * GET /api/reports/grade-distribution
 */
router.get('/grade-distribution', asyncHandler(async (req, res) => {
    const { courseId, semester, academicYear } = req.query;

    let query = `
        SELECT e.grade, COUNT(*) as count
        FROM enrollments e
        JOIN course_offerings co ON e.course_offering_id = co.id
        WHERE e.is_grade_published = true AND e.grade IS NOT NULL
    `;

    const params = [];
    let paramCount = 1;

    if (courseId) {
        query += ` AND co.course_id = $${paramCount}`;
        params.push(courseId);
        paramCount++;
    }

    if (semester) {
        query += ` AND co.semester = $${paramCount}`;
        params.push(semester);
        paramCount++;
    }

    if (academicYear) {
        query += ` AND co.academic_year = $${paramCount}`;
        params.push(academicYear);
        paramCount++;
    }

    query += ' GROUP BY e.grade ORDER BY e.grade';

    const result = await db.query(query, params);

    res.json({
        success: true,
        data: result.rows
    });
}));

/**
 * Get academic standing report
 * GET /api/reports/academic-standing
 */
router.get('/academic-standing', asyncHandler(async (req, res) => {
    const result = await db.query(`
        SELECT academic_standing, COUNT(*) as count
        FROM students
        GROUP BY academic_standing
        ORDER BY academic_standing
    `);

    res.json({
        success: true,
        data: result.rows
    });
}));

/**
 * Get department statistics
 * GET /api/reports/department-stats
 */
router.get('/department-stats', asyncHandler(async (req, res) => {
    const result = await db.query(`
        SELECT d.name as department,
               COUNT(DISTINCT s.id) as total_students,
               ROUND(AVG(s.cumulative_gpa), 2) as average_gpa,
               COUNT(DISTINCT c.id) as total_courses
        FROM departments d
        LEFT JOIN students s ON d.id = s.department_id
        LEFT JOIN courses c ON d.id = c.department_id
        GROUP BY d.id, d.name
        ORDER BY d.name
    `);

    res.json({
        success: true,
        data: result.rows
    });
}));

module.exports = router;
