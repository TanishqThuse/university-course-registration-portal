/**
 * Grade Management Controller
 * Handles grade entry, GPA calculation, and transcript generation
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const { APIError } = require('../middleware/errorHandler');
const { sendGradeNotification } = require('../utils/email');

// Grade to grade points mapping
const GRADE_POINTS = {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0,
    'P': null,  // Pass/No Pass doesn't affect GPA
    'NP': null,
    'W': null,  // Withdrawal
    'I': null   // Incomplete
};

/**
 * Calculate GPA for a student
 */
const calculateGPA = async (studentId, semester = null, academicYear = null) => {
    let query = `
        SELECT c.credits, e.grade_points
        FROM enrollments e
        JOIN course_offerings co ON e.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        WHERE e.student_id = $1 
        AND e.status = 'completed' 
        AND e.is_grade_published = true
        AND e.grade_points IS NOT NULL
    `;

    const params = [studentId];

    if (semester && academicYear) {
        query += ' AND co.semester = $2 AND co.academic_year = $3';
        params.push(semester, academicYear);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
        return { gpa: 0, totalCredits: 0, qualityPoints: 0 };
    }

    let totalCredits = 0;
    let qualityPoints = 0;

    for (const row of result.rows) {
        totalCredits += parseFloat(row.credits);
        qualityPoints += parseFloat(row.credits) * parseFloat(row.grade_points);
    }

    const gpa = totalCredits > 0 ? (qualityPoints / totalCredits).toFixed(2) : 0;

    return {
        gpa: parseFloat(gpa),
        totalCredits,
        qualityPoints
    };
};

/**
 * Determine academic standing based on GPA
 */
const determineAcademicStanding = (gpa) => {
    if (gpa >= 3.5) return "Dean's List";
    if (gpa >= 3.0) return 'Good Standing';
    if (gpa >= 2.0) return 'Satisfactory';
    if (gpa >= 1.5) return 'Academic Warning';
    return 'Academic Probation';
};

/**
 * Submit grades for a course (Faculty)
 * POST /api/grades
 */
const submitGrades = async (req, res) => {
    const { grades } = req.body; // Array of { enrollmentId, letterGrade, percentage, comments }

    try {
        // Get faculty ID
        const facultyResult = await db.query(
            'SELECT id FROM faculty WHERE user_id = $1',
            [req.user.id]
        );

        if (facultyResult.rows.length === 0) {
            throw new APIError('Faculty profile not found', 404);
        }

        const facultyId = facultyResult.rows[0].id;

        const results = [];

        for (const gradeData of grades) {
            const { enrollmentId, letterGrade, percentage, comments } = gradeData;

            // Verify enrollment exists and faculty teaches the course
            const enrollmentResult = await db.query(
                `SELECT e.*, co.faculty_id, co.course_id, s.user_id as student_user_id
                 FROM enrollments e
                 JOIN course_offerings co ON e.course_offering_id = co.id
                 JOIN students s ON e.student_id = s.id
                 WHERE e.id = $1`,
                [enrollmentId]
            );

            if (enrollmentResult.rows.length === 0) {
                results.push({
                    enrollmentId,
                    success: false,
                    message: 'Enrollment not found'
                });
                continue;
            }

            const enrollment = enrollmentResult.rows[0];

            if (enrollment.faculty_id !== facultyId) {
                results.push({
                    enrollmentId,
                    success: false,
                    message: 'Not authorized to grade this course'
                });
                continue;
            }

            // Get grade points
            const gradePoints = GRADE_POINTS[letterGrade];

            if (gradePoints === undefined) {
                results.push({
                    enrollmentId,
                    success: false,
                    message: 'Invalid letter grade'
                });
                continue;
            }

            // Insert or update grade
            await db.query(
                `INSERT INTO grades (enrollment_id, letter_grade, grade_points, percentage, submitted_by, submitted_date, comments)
                 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
                 ON CONFLICT (enrollment_id) 
                 DO UPDATE SET letter_grade = $2, grade_points = $3, percentage = $4, 
                               submitted_by = $5, submitted_date = CURRENT_TIMESTAMP, comments = $6`,
                [enrollmentId, letterGrade, gradePoints, percentage, facultyId, comments]
            );

            // Update enrollment
            await db.query(
                `UPDATE enrollments 
                 SET grade = $1, grade_points = $2
                 WHERE id = $3`,
                [letterGrade, gradePoints, enrollmentId]
            );

            results.push({
                enrollmentId,
                success: true,
                message: 'Grade submitted successfully'
            });
        }

        logger.info('Grades submitted', { facultyId, count: grades.length, userId: req.user.id });

        res.json({
            success: true,
            message: 'Grades processed',
            data: results
        });
    } catch (error) {
        logger.error('Submit grades error:', error);
        throw error;
    }
};

/**
 * Approve and publish grades (Admin)
 * POST /api/grades/approve/:gradeId
 */
const approveGrade = async (req, res) => {
    const { gradeId } = req.params;

    try {
        // Get grade details
        const gradeResult = await db.query(
            `SELECT g.*, e.student_id, s.user_id as student_user_id, co.course_id
             FROM grades g
             JOIN enrollments e ON g.enrollment_id = e.id
             JOIN students s ON e.student_id = s.id
             JOIN course_offerings co ON e.course_offering_id = co.id
             WHERE g.id = $1`,
            [gradeId]
        );

        if (gradeResult.rows.length === 0) {
            throw new APIError('Grade not found', 404);
        }

        const grade = gradeResult.rows[0];

        // Approve and publish grade
        await db.query(
            `UPDATE grades 
             SET is_approved = true, approved_by = $1, approved_date = CURRENT_TIMESTAMP,
                 is_published = true, published_date = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [req.user.id, gradeId]
        );

        // Update enrollment
        await db.query(
            `UPDATE enrollments 
             SET is_grade_published = true, status = 'completed'
             WHERE id = $1`,
            [grade.enrollment_id]
        );

        // Recalculate student GPA
        const gpaData = await calculateGPA(grade.student_id);
        const academicStanding = determineAcademicStanding(gpaData.gpa);

        await db.query(
            `UPDATE students 
             SET cumulative_gpa = $1, total_credits_completed = $2, academic_standing = $3
             WHERE id = $4`,
            [gpaData.gpa, gpaData.totalCredits, academicStanding, grade.student_id]
        );

        // Send notification to student
        const userResult = await db.query(
            'SELECT email, first_name, last_name FROM users WHERE id = $1',
            [grade.student_user_id]
        );

        const courseResult = await db.query(
            'SELECT course_code, course_name FROM courses WHERE id = $1',
            [grade.course_id]
        );

        await sendGradeNotification(userResult.rows[0], courseResult.rows[0], grade.letter_grade);

        logger.info('Grade approved and published', { gradeId, studentId: grade.student_id, userId: req.user.id });

        res.json({
            success: true,
            message: 'Grade approved and published successfully'
        });
    } catch (error) {
        logger.error('Approve grade error:', error);
        throw error;
    }
};

/**
 * Get grades for a course (Faculty)
 * GET /api/grades/course/:courseOfferingId
 */
const getCourseGrades = async (req, res) => {
    const { courseOfferingId } = req.params;

    try {
        const result = await db.query(
            `SELECT e.id as enrollment_id, s.student_id, u.first_name, u.last_name, u.email,
                    e.grade, e.grade_points, g.percentage, g.comments, g.is_approved, g.is_published,
                    g.submitted_date
             FROM enrollments e
             JOIN students s ON e.student_id = s.id
             JOIN users u ON s.user_id = u.id
             LEFT JOIN grades g ON e.id = g.enrollment_id
             WHERE e.course_offering_id = $1 AND e.status IN ('enrolled', 'completed')
             ORDER BY u.last_name, u.first_name`,
            [courseOfferingId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Get course grades error:', error);
        throw error;
    }
};

/**
 * Get student transcript
 * GET /api/grades/transcript/:studentId
 */
const getTranscript = async (req, res) => {
    const { studentId } = req.params;

    try {
        // Get student info
        const studentResult = await db.query(
            `SELECT s.*, u.first_name, u.last_name, u.email, d.name as department_name
             FROM students s
             JOIN users u ON s.user_id = u.id
             LEFT JOIN departments d ON s.department_id = d.id
             WHERE s.id = $1`,
            [studentId]
        );

        if (studentResult.rows.length === 0) {
            throw new APIError('Student not found', 404);
        }

        const student = studentResult.rows[0];

        // Get all completed courses
        const coursesResult = await db.query(
            `SELECT c.course_code, c.course_name, c.credits, co.semester, co.academic_year,
                    e.grade, e.grade_points
             FROM enrollments e
             JOIN course_offerings co ON e.course_offering_id = co.id
             JOIN courses c ON co.course_id = c.id
             WHERE e.student_id = $1 AND e.status = 'completed' AND e.is_grade_published = true
             ORDER BY co.academic_year DESC, co.semester DESC, c.course_code`,
            [studentId]
        );

        // Calculate semester GPAs
        const semesterGPAs = {};
        for (const course of coursesResult.rows) {
            const key = `${course.semester} ${course.academic_year}`;
            if (!semesterGPAs[key]) {
                const gpaData = await calculateGPA(studentId, course.semester, course.academic_year);
                semesterGPAs[key] = gpaData.gpa;
            }
        }

        // Group courses by semester
        const coursesBySemester = {};
        for (const course of coursesResult.rows) {
            const key = `${course.semester} ${course.academic_year}`;
            if (!coursesBySemester[key]) {
                coursesBySemester[key] = [];
            }
            coursesBySemester[key].push(course);
        }

        res.json({
            success: true,
            data: {
                student: {
                    studentId: student.student_id,
                    name: `${student.first_name} ${student.last_name}`,
                    email: student.email,
                    department: student.department_name,
                    enrollmentYear: student.enrollment_year,
                    cumulativeGPA: student.cumulative_gpa,
                    totalCredits: student.total_credits_completed,
                    academicStanding: student.academic_standing
                },
                coursesBySemester,
                semesterGPAs
            }
        });
    } catch (error) {
        logger.error('Get transcript error:', error);
        throw error;
    }
};

/**
 * Get my grades (Student)
 * GET /api/grades/my-grades
 */
const getMyGrades = async (req, res) => {
    try {
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.id]
        );

        if (studentResult.rows.length === 0) {
            throw new APIError('Student profile not found', 404);
        }

        const studentId = studentResult.rows[0].id;

        const result = await db.query(
            `SELECT c.course_code, c.course_name, c.credits, co.semester, co.academic_year,
                    e.grade, e.grade_points, e.is_grade_published
             FROM enrollments e
             JOIN course_offerings co ON e.course_offering_id = co.id
             JOIN courses c ON co.course_id = c.id
             WHERE e.student_id = $1 AND e.status IN ('enrolled', 'completed')
             ORDER BY co.academic_year DESC, co.semester DESC, c.course_code`,
            [studentId]
        );

        // Calculate current semester GPA and cumulative GPA
        const cumulativeGPA = await calculateGPA(studentId);

        res.json({
            success: true,
            data: {
                grades: result.rows,
                cumulativeGPA: cumulativeGPA.gpa,
                totalCredits: cumulativeGPA.totalCredits
            }
        });
    } catch (error) {
        logger.error('Get my grades error:', error);
        throw error;
    }
};

module.exports = {
    submitGrades,
    approveGrade,
    getCourseGrades,
    getTranscript,
    getMyGrades,
    calculateGPA
};
