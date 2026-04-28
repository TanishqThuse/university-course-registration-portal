-- University Course Registration and Result Management System
-- Database Schema
-- PostgreSQL 14+

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS grade_modifications CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS waitlists CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS prerequisites CASCADE;
DROP TABLE IF EXISTS course_offerings CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USERS TABLE (Base authentication table)
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    enrollment_year INTEGER NOT NULL,
    current_semester INTEGER DEFAULT 1,
    total_credits_completed DECIMAL(5,2) DEFAULT 0,
    cumulative_gpa DECIMAL(3,2) DEFAULT 0,
    academic_standing VARCHAR(50) DEFAULT 'Good Standing',
    max_credits_per_semester INTEGER DEFAULT 18,
    min_credits_per_semester INTEGER DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_gpa CHECK (cumulative_gpa >= 0 AND cumulative_gpa <= 4.0),
    CONSTRAINT valid_credits CHECK (total_credits_completed >= 0)
);

-- ============================================
-- FACULTY TABLE
-- ============================================
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    faculty_id VARCHAR(20) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    designation VARCHAR(100),
    specialization TEXT,
    office_location VARCHAR(100),
    office_hours TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- COURSES TABLE (Course catalog)
-- ============================================
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    credits INTEGER NOT NULL,
    description TEXT,
    course_level VARCHAR(20) CHECK (course_level IN ('undergraduate', 'graduate')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_credits CHECK (credits > 0 AND credits <= 6)
);

-- ============================================
-- COURSE OFFERINGS TABLE (Semester-specific instances)
-- ============================================
CREATE TABLE course_offerings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL,
    semester VARCHAR(20) NOT NULL,
    academic_year INTEGER NOT NULL,
    section VARCHAR(10) NOT NULL,
    max_capacity INTEGER NOT NULL,
    current_enrollment INTEGER DEFAULT 0,
    room_number VARCHAR(50),
    schedule_days VARCHAR(50), -- e.g., "MWF" or "TTh"
    start_time TIME,
    end_time TIME,
    registration_start_date DATE,
    registration_end_date DATE,
    add_drop_deadline DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_capacity CHECK (max_capacity > 0),
    CONSTRAINT valid_enrollment CHECK (current_enrollment >= 0 AND current_enrollment <= max_capacity),
    CONSTRAINT valid_time CHECK (end_time > start_time),
    UNIQUE(course_id, semester, academic_year, section)
);

-- ============================================
-- PREREQUISITES TABLE
-- ============================================
CREATE TABLE prerequisites (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    is_corequisite BOOLEAN DEFAULT false,
    minimum_grade VARCHAR(2) DEFAULT 'D',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_prerequisite CHECK (course_id != prerequisite_course_id),
    UNIQUE(course_id, prerequisite_course_id)
);

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_offering_id INTEGER NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed', 'withdrawn')),
    dropped_date TIMESTAMP,
    grade VARCHAR(2),
    grade_points DECIMAL(3,2),
    is_grade_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_enrollment UNIQUE(student_id, course_offering_id)
);

-- ============================================
-- WAITLISTS TABLE
-- ============================================
CREATE TABLE waitlists (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_offering_id INTEGER NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'enrolled', 'expired', 'removed')),
    notified_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_waitlist UNIQUE(student_id, course_offering_id)
);

-- ============================================
-- GRADES TABLE
-- ============================================
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER UNIQUE NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    letter_grade VARCHAR(2) NOT NULL,
    grade_points DECIMAL(3,2) NOT NULL,
    percentage DECIMAL(5,2),
    submitted_by INTEGER REFERENCES faculty(id),
    submitted_date TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    approved_date TIMESTAMP,
    is_approved BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    published_date TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_grade_points CHECK (grade_points >= 0 AND grade_points <= 4.0),
    CONSTRAINT valid_percentage CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100))
);

-- ============================================
-- GRADE MODIFICATIONS TABLE (Audit trail)
-- ============================================
CREATE TABLE grade_modifications (
    id SERIAL PRIMARY KEY,
    grade_id INTEGER NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    old_grade VARCHAR(2),
    new_grade VARCHAR(2) NOT NULL,
    old_grade_points DECIMAL(3,2),
    new_grade_points DECIMAL(3,2) NOT NULL,
    reason TEXT NOT NULL,
    modified_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    modification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    is_approved BOOLEAN DEFAULT false
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_email_sent BOOLEAN DEFAULT false,
    email_sent_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Students indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_department ON students(department_id);

-- Faculty indexes
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_faculty_department ON faculty(department_id);

-- Courses indexes
CREATE INDEX idx_courses_code ON courses(course_code);
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_courses_active ON courses(is_active);

-- Course offerings indexes
CREATE INDEX idx_offerings_course ON course_offerings(course_id);
CREATE INDEX idx_offerings_faculty ON course_offerings(faculty_id);
CREATE INDEX idx_offerings_semester ON course_offerings(semester, academic_year);
CREATE INDEX idx_offerings_status ON course_offerings(status);

-- Enrollments indexes
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_offering ON enrollments(course_offering_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_student_status ON enrollments(student_id, status);

-- Waitlists indexes
CREATE INDEX idx_waitlists_student ON waitlists(student_id);
CREATE INDEX idx_waitlists_offering ON waitlists(course_offering_id);
CREATE INDEX idx_waitlists_status ON waitlists(status);

-- Grades indexes
CREATE INDEX idx_grades_enrollment ON grades(enrollment_id);
CREATE INDEX idx_grades_published ON grades(is_published);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Audit logs indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_offerings_updated_at BEFORE UPDATE ON course_offerings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlists_updated_at BEFORE UPDATE ON waitlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update enrollment count when student enrolls
CREATE OR REPLACE FUNCTION update_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'enrolled' THEN
        UPDATE course_offerings 
        SET current_enrollment = current_enrollment + 1
        WHERE id = NEW.course_offering_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'enrolled' AND NEW.status != 'enrolled' THEN
            UPDATE course_offerings 
            SET current_enrollment = current_enrollment - 1
            WHERE id = NEW.course_offering_id;
        ELSIF OLD.status != 'enrolled' AND NEW.status = 'enrolled' THEN
            UPDATE course_offerings 
            SET current_enrollment = current_enrollment + 1
            WHERE id = NEW.course_offering_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'enrolled' THEN
        UPDATE course_offerings 
        SET current_enrollment = current_enrollment - 1
        WHERE id = OLD.course_offering_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER enrollment_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON enrollments
FOR EACH ROW EXECUTE FUNCTION update_enrollment_count();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for student transcript
CREATE OR REPLACE VIEW student_transcript AS
SELECT 
    s.id as student_id,
    s.student_id,
    u.first_name,
    u.last_name,
    c.course_code,
    c.course_name,
    c.credits,
    co.semester,
    co.academic_year,
    g.letter_grade,
    g.grade_points,
    e.status as enrollment_status
FROM students s
JOIN users u ON s.user_id = u.id
JOIN enrollments e ON s.id = e.student_id
JOIN course_offerings co ON e.course_offering_id = co.id
JOIN courses c ON co.course_id = c.id
LEFT JOIN grades g ON e.id = g.enrollment_id
WHERE e.status IN ('completed', 'enrolled')
ORDER BY co.academic_year DESC, co.semester DESC;

-- View for course enrollment details
CREATE OR REPLACE VIEW course_enrollment_details AS
SELECT 
    co.id as offering_id,
    c.course_code,
    c.course_name,
    co.section,
    co.semester,
    co.academic_year,
    co.max_capacity,
    co.current_enrollment,
    co.max_capacity - co.current_enrollment as available_seats,
    f.faculty_id,
    fu.first_name || ' ' || fu.last_name as faculty_name,
    co.schedule_days,
    co.start_time,
    co.end_time,
    co.room_number
FROM course_offerings co
JOIN courses c ON co.course_id = c.id
LEFT JOIN faculty f ON co.faculty_id = f.id
LEFT JOIN users fu ON f.user_id = fu.id
WHERE co.status = 'active';

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Base authentication table for all system users';
COMMENT ON TABLE students IS 'Student-specific information and academic records';
COMMENT ON TABLE faculty IS 'Faculty member information and assignments';
COMMENT ON TABLE courses IS 'Course catalog with course definitions';
COMMENT ON TABLE course_offerings IS 'Semester-specific course instances';
COMMENT ON TABLE enrollments IS 'Student course registrations';
COMMENT ON TABLE waitlists IS 'Waitlist management for full courses';
COMMENT ON TABLE grades IS 'Student grades and academic results';
COMMENT ON TABLE audit_logs IS 'System activity audit trail';

-- ============================================
-- GRANT PERMISSIONS (Adjust based on your setup)
-- ============================================

-- Example: Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO university_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO university_app_user;
