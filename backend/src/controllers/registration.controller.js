/**
 * Course Registration Controller
 * Handles student course registration, prerequisite validation, conflict detection, and waitlist
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const { APIError } = require('../middleware/errorHandler');
const { sendRegistrationConfirmation, sendWaitlistNotification, sendWaitlistEnrollmentNotification } = require('../utils/email');

/**
 * Check if student meets prerequisite requirements
 */
const checkPrerequisites = async (studentId, courseId) => {
    // Get all prerequisites for the course
    const prereqResult = await db.query(
        `SELECT p.*, c.course_code, c.course_name
         FROM prerequisites p
         JOIN courses c ON p.prerequisite_course_id = c.id
         WHERE p.course_id = $1`,
        [courseId]
    );

    if (prereqResult.rows.length === 0) {
        return { met: true, missing: [] };
    }

    // Get student's completed courses with grades
    const completedResult = await db.query(
        `SELECT co.course_id, c.course_code, e.grade, e.grade_points
         FROM enrollments e
         JOIN course_offerings co ON e.course_offering_id = co.id
         JOIN courses c ON co.course_id = c.id
         WHERE e.student_id = $1 AND e.status = 'completed' AND e.is_grade_published = true`,
        [studentId]
    );

    const completedCourses = new Map(
        completedResult.rows.map(row => [row.course_id, row])
    );

    // Grade to grade points mapping
    const gradePoints = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    const missingPrereqs = [];

    for (const prereq of prereqResult.rows) {
        const completed = completedCourses.get(prereq.prerequisite_course_id);
        
        if (!completed) {
            missingPrereqs.push({
                courseCode: prereq.course_code,
                courseName: prereq.course_name,
                reason: 'Not completed'
            });
        } else {
            // Check minimum grade requirement
            const minGradePoints = gradePoints[prereq.minimum_grade] || 0;
            const studentGradePoints = completed.grade_points || 0;

            if (studentGradePoints < minGradePoints) {
                missingPrereqs.push({
                    courseCode: prereq.course_code,
                    courseName: prereq.course_name,
                    reason: `Minimum grade ${prereq.minimum_grade} required, got ${completed.grade}`
                });
            }
        }
    }

    return {
        met: missingPrereqs.length === 0,
        missing: missingPrereqs
    };
};

/**
 * Check for schedule conflicts
 */
const checkScheduleConflicts = async (studentId, offeringId) => {
    // Get the offering's schedule
    const offeringResult = await db.query(
        `SELECT schedule_days, start_time, end_time
         FROM course_offerings
         WHERE id = $1`,
        [offeringId]
    );

    if (offeringResult.rows.length === 0) {
        throw new APIError('Course offering not found', 404);
    }

    const newOffering = offeringResult.rows[0];

    // If no schedule defined, no conflict possible
    if (!newOffering.schedule_days || !newOffering.start_time || !newOffering.end_time) {
        return { hasConflict: false, conflicts: [] };
    }

    // Get student's current enrollments for the same semester
    const enrollmentsResult = await db.query(
        `SELECT co.id, c.course_code, c.course_name, co.schedule_days, 
                co.start_time, co.end_time, co.semester, co.academic_year
         FROM enrollments e
         JOIN course_offerings co ON e.course_offering_id = co.id
         JOIN courses c ON co.course_id = c.id
         WHERE e.student_id = $1 AND e.status = 'enrolled'
         AND co.semester = (SELECT semester FROM course_offerings WHERE id = $2)
         AND co.academic_year = (SELECT academic_year FROM course_offerings WHERE id = $2)`,
        [studentId, offeringId]
    );

    const conflicts = [];

    for (const enrollment of enrollmentsResult.rows) {
        if (!enrollment.schedule_days || !enrollment.start_time || !enrollment.end_time) {
            continue;
        }

        // Check if days overlap
        const newDays = newOffering.schedule_days.split('');
        const existingDays = enrollment.schedule_days.split('');
        const daysOverlap = newDays.some(day => existingDays.includes(day));

        if (!daysOverlap) {
            continue;
        }

        // Check if times overlap
        const newStart = newOffering.start_time;
        const newEnd = newOffering.end_time;
        const existingStart = enrollment.start_time;
        const existingEnd = enrollment.end_time;

        const timesOverlap = (newStart < existingEnd && newEnd > existingStart);

        if (timesOverlap) {
            conflicts.push({
                courseCode: enrollment.course_code,
                courseName: enrollment.course_name,
                schedule: `${enrollment.schedule_days} ${enrollment.start_time}-${enrollment.end_time}`
            });
        }
    }

    return {
        hasConflict: conflicts.length > 0,
        conflicts
    };
};

/**
 * Check credit hour limits
 */
const checkCreditLimits = async (studentId, offeringId) => {
    // Get student's credit limits
    const studentResult = await db.query(
        'SELECT min_credits_per_semester, max_credits_per_semester FROM students WHERE id = $1',
        [studentId]
    );

    if (studentResult.rows.length === 0) {
        throw new APIError('Student not found', 404);
    }

    const { min_credits_per_semester, max_credits_per_semester } = studentResult.rows[0];

    // Get credits for the new course
    const courseResult = await db.query(
        `SELECT c.credits FROM course_offerings co
         JOIN courses c ON co.course_id = c.id
         WHERE co.id = $1`,
        [offeringId]
    );

    const newCredits = courseResult.rows[0].credits;

    // Get current semester's total credits
    const creditsResult = await db.query(
        `SELECT COALESCE(SUM(c.credits), 0) as total_credits
         FROM enrollments e
         JOIN course_offerings co ON e.course_offering_id = co.id
         JOIN courses c ON co.course_id = c.id
         WHERE e.student_id = $1 AND e.status = 'enrolled'
         AND co.semester = (SELECT semester FROM course_offerings WHERE id = $2)
         AND co.academic_year = (SELECT academic_year FROM course_offerings WHERE id = $2)`,
        [studentId, offeringId]
    );

    const currentCredits = parseInt(creditsResult.rows[0].total_credits);
    const totalCredits = currentCredits + newCredits;

    return {
        withinLimits: totalCredits <= max_credits_per_semester,
        currentCredits,
        newCredits,
        totalCredits,
        maxCredits: max_credits_per_semester
    };
};

/**
 * Enroll in course
 * POST /api/registration/enroll
 */
const enrollInCourse = async (req, res) => {
    const { courseOfferingId } = req.body;

    try {
        // Get student ID
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.id]
        );

        if (studentResult.rows.length === 0) {
            throw new APIError('Student profile not found', 404);
        }

        const studentId = studentResult.rows[0].id;

        // Get course offering details
        const offeringResult = await db.query(
            `SELECT co.*, c.course_code, c.course_name, c.id as course_id
             FROM course_offerings co
             JOIN courses c ON co.course_id = c.id
             WHERE co.id = $1 AND co.status = 'active'`,
            [courseOfferingId]
        );

        if (offeringResult.rows.length === 0) {
            throw new APIError('Course offering not found or not available', 404);
        }

        const offering = offeringResult.rows[0];

        // Check if already enrolled
        const existingEnrollment = await db.query(
            'SELECT id FROM enrollments WHERE student_id = $1 AND course_offering_id = $2 AND status = \'enrolled\'',
            [studentId, courseOfferingId]
        );

        if (existingEnrollment.rows.length > 0) {
            throw new APIError('Already enrolled in this course', 400);
        }

        // Check prerequisites
        const prereqCheck = await checkPrerequisites(studentId, offering.course_id);
        if (!prereqCheck.met) {
            return res.status(400).json({
                success: false,
                message: 'Prerequisites not met',
                data: { missingPrerequisites: prereqCheck.missing }
            });
        }

        // Check schedule conflicts
        const conflictCheck = await checkScheduleConflicts(studentId, courseOfferingId);
        if (conflictCheck.hasConflict) {
            return res.status(400).json({
                success: false,
                message: 'Schedule conflict detected',
                data: { conflicts: conflictCheck.conflicts }
            });
        }

        // Check credit limits
        const creditCheck = await checkCreditLimits(studentId, courseOfferingId);
        if (!creditCheck.withinLimits) {
            return res.status(400).json({
                success: false,
                message: 'Credit limit exceeded',
                data: creditCheck
            });
        }

        // Check if course is full
        if (offering.current_enrollment >= offering.max_capacity) {
            throw new APIError('Course is full. Consider joining the waitlist.', 400);
        }

        // Enroll student
        const enrollmentResult = await db.query(
            `INSERT INTO enrollments (student_id, course_offering_id, status)
             VALUES ($1, $2, 'enrolled')
             RETURNING *`,
            [studentId, courseOfferingId]
        );

        // Send confirmation email
        const userResult = await db.query(
            'SELECT email, first_name, last_name FROM users WHERE id = $1',
            [req.user.id]
        );

        await sendRegistrationConfirmation(userResult.rows[0], [{
            course_code: offering.course_code,
            course_name: offering.course_name
        }]);

        logger.info('Student enrolled in course', {
            studentId,
            offeringId: courseOfferingId,
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
            data: enrollmentResult.rows[0]
        });
    } catch (error) {
        logger.error('Enrollment error:', error);
        throw error;
    }
};

/**
 * Drop course
 * DELETE /api/registration/drop/:enrollmentId
 */
const dropCourse = async (req, res) => {
    const { enrollmentId } = req.params;

    try {
        // Get student ID
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.id]
        );

        const studentId = studentResult.rows[0].id;

        // Check if enrollment exists and belongs to student
        const enrollmentResult = await db.query(
            `SELECT e.*, co.add_drop_deadline
             FROM enrollments e
             JOIN course_offerings co ON e.course_offering_id = co.id
             WHERE e.id = $1 AND e.student_id = $2 AND e.status = 'enrolled'`,
            [enrollmentId, studentId]
        );

        if (enrollmentResult.rows.length === 0) {
            throw new APIError('Enrollment not found', 404);
        }

        const enrollment = enrollmentResult.rows[0];

        // Check add/drop deadline
        if (enrollment.add_drop_deadline && new Date() > new Date(enrollment.add_drop_deadline)) {
            throw new APIError('Add/drop deadline has passed', 400);
        }

        // Drop the course
        await db.query(
            `UPDATE enrollments 
             SET status = 'dropped', dropped_date = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [enrollmentId]
        );

        // Check waitlist and enroll next student
        await processWaitlist(enrollment.course_offering_id);

        logger.info('Student dropped course', {
            studentId,
            enrollmentId,
            userId: req.user.id
        });

        res.json({
            success: true,
            message: 'Successfully dropped course'
        });
    } catch (error) {
        logger.error('Drop course error:', error);
        throw error;
    }
};

/**
 * Join waitlist
 * POST /api/registration/waitlist
 */
const joinWaitlist = async (req, res) => {
    const { courseOfferingId } = req.body;

    try {
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.id]
        );

        const studentId = studentResult.rows[0].id;

        // Check if already on waitlist
        const existingWaitlist = await db.query(
            'SELECT id FROM waitlists WHERE student_id = $1 AND course_offering_id = $2 AND status = \'waiting\'',
            [studentId, courseOfferingId]
        );

        if (existingWaitlist.rows.length > 0) {
            throw new APIError('Already on waitlist for this course', 400);
        }

        // Get next position
        const positionResult = await db.query(
            'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM waitlists WHERE course_offering_id = $1',
            [courseOfferingId]
        );

        const position = positionResult.rows[0].next_position;

        // Add to waitlist
        await db.query(
            `INSERT INTO waitlists (student_id, course_offering_id, position, status)
             VALUES ($1, $2, $3, 'waiting')`,
            [studentId, courseOfferingId, position]
        );

        // Send notification
        const courseResult = await db.query(
            `SELECT c.course_code, c.course_name
             FROM course_offerings co
             JOIN courses c ON co.course_id = c.id
             WHERE co.id = $1`,
            [courseOfferingId]
        );

        const userResult = await db.query(
            'SELECT email, first_name, last_name FROM users WHERE id = $1',
            [req.user.id]
        );

        await sendWaitlistNotification(userResult.rows[0], courseResult.rows[0], position);

        logger.info('Student joined waitlist', { studentId, offeringId: courseOfferingId, position });

        res.status(201).json({
            success: true,
            message: 'Successfully added to waitlist',
            data: { position }
        });
    } catch (error) {
        logger.error('Join waitlist error:', error);
        throw error;
    }
};

/**
 * Process waitlist when a seat becomes available
 */
const processWaitlist = async (courseOfferingId) => {
    try {
        // Get first student on waitlist
        const waitlistResult = await db.query(
            `SELECT w.*, s.user_id
             FROM waitlists w
             JOIN students s ON w.student_id = s.id
             WHERE w.course_offering_id = $1 AND w.status = 'waiting'
             ORDER BY w.position
             LIMIT 1`,
            [courseOfferingId]
        );

        if (waitlistResult.rows.length === 0) {
            return; // No one on waitlist
        }

        const waitlistEntry = waitlistResult.rows[0];

        // Check if seat is available
        const offeringResult = await db.query(
            'SELECT current_enrollment, max_capacity FROM course_offerings WHERE id = $1',
            [courseOfferingId]
        );

        const offering = offeringResult.rows[0];

        if (offering.current_enrollment < offering.max_capacity) {
            // Enroll student from waitlist
            await db.transaction(async (client) => {
                // Create enrollment
                await client.query(
                    `INSERT INTO enrollments (student_id, course_offering_id, status)
                     VALUES ($1, $2, 'enrolled')`,
                    [waitlistEntry.student_id, courseOfferingId]
                );

                // Update waitlist status
                await client.query(
                    `UPDATE waitlists SET status = 'enrolled', notified_date = CURRENT_TIMESTAMP
                     WHERE id = $1`,
                    [waitlistEntry.id]
                );
            });

            // Send notification
            const userResult = await db.query(
                'SELECT email, first_name, last_name FROM users WHERE id = $1',
                [waitlistEntry.user_id]
            );

            const courseResult = await db.query(
                `SELECT c.course_code, c.course_name
                 FROM course_offerings co
                 JOIN courses c ON co.course_id = c.id
                 WHERE co.id = $1`,
                [courseOfferingId]
            );

            await sendWaitlistEnrollmentNotification(userResult.rows[0], courseResult.rows[0]);

            logger.info('Student enrolled from waitlist', {
                studentId: waitlistEntry.student_id,
                offeringId: courseOfferingId
            });
        }
    } catch (error) {
        logger.error('Process waitlist error:', error);
    }
};

/**
 * Get student's current schedule
 * GET /api/registration/my-schedule
 */
const getMySchedule = async (req, res) => {
    try {
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.id]
        );

        const studentId = studentResult.rows[0].id;

        const result = await db.query(
            `SELECT e.id as enrollment_id, c.course_code, c.course_name, c.credits,
                    co.section, co.semester, co.academic_year, co.schedule_days,
                    co.start_time, co.end_time, co.room_number,
                    u.first_name || ' ' || u.last_name as faculty_name,
                    e.status, e.grade, e.is_grade_published
             FROM enrollments e
             JOIN course_offerings co ON e.course_offering_id = co.id
             JOIN courses c ON co.course_id = c.id
             LEFT JOIN faculty f ON co.faculty_id = f.id
             LEFT JOIN users u ON f.user_id = u.id
             WHERE e.student_id = $1 AND e.status IN ('enrolled', 'completed')
             ORDER BY co.academic_year DESC, co.semester DESC, c.course_code`,
            [studentId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Get schedule error:', error);
        throw error;
    }
};

/**
 * Get available courses for registration
 * GET /api/registration/available-courses
 */
const getAvailableCourses = async (req, res) => {
    const { semester, academicYear, department } = req.query;

    try {
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.id]
        );

        const studentId = studentResult.rows[0].id;

        let query = `
            SELECT co.id as offering_id, c.id as course_id, c.course_code, c.course_name, 
                   c.credits, c.description, co.section, co.semester, co.academic_year,
                   co.max_capacity, co.current_enrollment,
                   co.max_capacity - co.current_enrollment as available_seats,
                   co.schedule_days, co.start_time, co.end_time, co.room_number,
                   d.name as department_name,
                   u.first_name || ' ' || u.last_name as faculty_name
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN faculty f ON co.faculty_id = f.id
            LEFT JOIN users u ON f.user_id = u.id
            WHERE co.status = 'active'
            AND co.id NOT IN (
                SELECT course_offering_id FROM enrollments 
                WHERE student_id = $1 AND status = 'enrolled'
            )
        `;

        const params = [studentId];
        let paramCount = 2;

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

        query += ' ORDER BY c.course_code, co.section';

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Get available courses error:', error);
        throw error;
    }
};

module.exports = {
    enrollInCourse,
    dropCourse,
    joinWaitlist,
    getMySchedule,
    getAvailableCourses
};
