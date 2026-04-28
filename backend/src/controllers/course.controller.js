/**
 * Course Management Controller
 * Handles course catalog and course offerings
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const { APIError } = require('../middleware/errorHandler');

/**
 * Get all courses with optional filters
 * GET /api/courses
 */
const getCourses = async (req, res) => {
    const { department, level, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT c.*, d.name as department_name, d.code as department_code,
                   COUNT(*) OVER() as total_count
            FROM courses c
            LEFT JOIN departments d ON c.department_id = d.id
            WHERE c.is_active = true
        `;
        const params = [];
        let paramCount = 1;

        if (department) {
            query += ` AND c.department_id = $${paramCount}`;
            params.push(department);
            paramCount++;
        }

        if (level) {
            query += ` AND c.course_level = $${paramCount}`;
            params.push(level);
            paramCount++;
        }

        if (search) {
            query += ` AND (c.course_code ILIKE $${paramCount} OR c.course_name ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ` ORDER BY c.course_code LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: {
                courses: result.rows.map(row => {
                    const { total_count, ...course } = row;
                    return course;
                }),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        logger.error('Get courses error:', error);
        throw error;
    }
};

/**
 * Get course by ID
 * GET /api/courses/:id
 */
const getCourseById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            `SELECT c.*, d.name as department_name, d.code as department_code
             FROM courses c
             LEFT JOIN departments d ON c.department_id = d.id
             WHERE c.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new APIError('Course not found', 404);
        }

        // Get prerequisites
        const prereqResult = await db.query(
            `SELECT p.*, c.course_code, c.course_name
             FROM prerequisites p
             JOIN courses c ON p.prerequisite_course_id = c.id
             WHERE p.course_id = $1`,
            [id]
        );

        const course = {
            ...result.rows[0],
            prerequisites: prereqResult.rows
        };

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        logger.error('Get course error:', error);
        throw error;
    }
};

/**
 * Create new course (Admin only)
 * POST /api/courses
 */
const createCourse = async (req, res) => {
    const { courseCode, courseName, departmentId, credits, description, courseLevel } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO courses (course_code, course_name, department_id, credits, description, course_level)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [courseCode, courseName, departmentId, credits, description, courseLevel]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
             VALUES ($1, 'create', 'course', $2, $3)`,
            [req.user.id, result.rows[0].id, JSON.stringify(result.rows[0])]
        );

        logger.info('Course created', { courseId: result.rows[0].id, userId: req.user.id });

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Create course error:', error);
        throw error;
    }
};

/**
 * Update course (Admin only)
 * PUT /api/courses/:id
 */
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { courseCode, courseName, departmentId, credits, description, courseLevel, isActive } = req.body;

    try {
        // Get old values for audit
        const oldResult = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
        
        if (oldResult.rows.length === 0) {
            throw new APIError('Course not found', 404);
        }

        const result = await db.query(
            `UPDATE courses 
             SET course_code = $1, course_name = $2, department_id = $3, 
                 credits = $4, description = $5, course_level = $6, is_active = $7
             WHERE id = $8
             RETURNING *`,
            [courseCode, courseName, departmentId, credits, description, courseLevel, isActive, id]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
             VALUES ($1, 'update', 'course', $2, $3, $4)`,
            [req.user.id, id, JSON.stringify(oldResult.rows[0]), JSON.stringify(result.rows[0])]
        );

        logger.info('Course updated', { courseId: id, userId: req.user.id });

        res.json({
            success: true,
            message: 'Course updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Update course error:', error);
        throw error;
    }
};

/**
 * Delete course (Admin only)
 * DELETE /api/courses/:id
 */
const deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if course has any offerings
        const offeringsResult = await db.query(
            'SELECT COUNT(*) as count FROM course_offerings WHERE course_id = $1',
            [id]
        );

        if (parseInt(offeringsResult.rows[0].count) > 0) {
            throw new APIError('Cannot delete course with existing offerings. Deactivate instead.', 400);
        }

        const result = await db.query(
            'DELETE FROM courses WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            throw new APIError('Course not found', 404);
        }

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values)
             VALUES ($1, 'delete', 'course', $2, $3)`,
            [req.user.id, id, JSON.stringify(result.rows[0])]
        );

        logger.info('Course deleted', { courseId: id, userId: req.user.id });

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        logger.error('Delete course error:', error);
        throw error;
    }
};

/**
 * Get course offerings with filters
 * GET /api/courses/offerings
 */
const getCourseOfferings = async (req, res) => {
    const { semester, academicYear, department, facultyId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT co.*, c.course_code, c.course_name, c.credits,
                   d.name as department_name,
                   f.faculty_id, u.first_name || ' ' || u.last_name as faculty_name,
                   co.max_capacity - co.current_enrollment as available_seats,
                   COUNT(*) OVER() as total_count
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN faculty f ON co.faculty_id = f.id
            LEFT JOIN users u ON f.user_id = u.id
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

        if (department) {
            query += ` AND c.department_id = $${paramCount}`;
            params.push(department);
            paramCount++;
        }

        if (facultyId) {
            query += ` AND co.faculty_id = $${paramCount}`;
            params.push(facultyId);
            paramCount++;
        }

        query += ` ORDER BY c.course_code, co.section LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: {
                offerings: result.rows.map(row => {
                    const { total_count, ...offering } = row;
                    return offering;
                }),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        logger.error('Get course offerings error:', error);
        throw error;
    }
};

/**
 * Create course offering (Admin only)
 * POST /api/courses/offerings
 */
const createCourseOffering = async (req, res) => {
    const {
        courseId, facultyId, semester, academicYear, section, maxCapacity,
        roomNumber, scheduleDays, startTime, endTime,
        registrationStartDate, registrationEndDate, addDropDeadline
    } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO course_offerings 
             (course_id, faculty_id, semester, academic_year, section, max_capacity,
              room_number, schedule_days, start_time, end_time,
              registration_start_date, registration_end_date, add_drop_deadline)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING *`,
            [courseId, facultyId, semester, academicYear, section, maxCapacity,
             roomNumber, scheduleDays, startTime, endTime,
             registrationStartDate, registrationEndDate, addDropDeadline]
        );

        logger.info('Course offering created', { offeringId: result.rows[0].id, userId: req.user.id });

        res.status(201).json({
            success: true,
            message: 'Course offering created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Create course offering error:', error);
        throw error;
    }
};

/**
 * Get departments
 * GET /api/courses/departments
 */
const getDepartments = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM departments ORDER BY name'
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Get departments error:', error);
        throw error;
    }
};

module.exports = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseOfferings,
    createCourseOffering,
    getDepartments
};
