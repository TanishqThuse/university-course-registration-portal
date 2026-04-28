-- Initial seed data for University Course Registration System
-- This includes test users, departments, courses, and sample data

-- ============================================
-- DEPARTMENTS
-- ============================================
INSERT INTO departments (code, name, description) VALUES
('CS', 'Computer Science', 'Department of Computer Science and Engineering'),
('MATH', 'Mathematics', 'Department of Mathematics'),
('PHYS', 'Physics', 'Department of Physics'),
('ENG', 'English', 'Department of English Literature'),
('BIO', 'Biology', 'Department of Biological Sciences'),
('CHEM', 'Chemistry', 'Department of Chemistry'),
('ECON', 'Economics', 'Department of Economics'),
('HIST', 'History', 'Department of History');

-- ============================================
-- USERS (Password for all: hashed version of "Password@123")
-- Note: In production, these should be changed immediately
-- ============================================

-- Admin Users
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('admin@university.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'admin', 'System', 'Administrator'),
('registrar@university.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'admin', 'Academic', 'Registrar');

-- Faculty Users
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('john.smith@university.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'faculty', 'John', 'Smith'),
('sarah.johnson@university.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'faculty', 'Sarah', 'Johnson'),
('michael.brown@university.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'faculty', 'Michael', 'Brown'),
('emily.davis@university.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'faculty', 'Emily', 'Davis'),
('robert.wilson@university.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'faculty', 'Robert', 'Wilson');

-- Student Users
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('alice.anderson@student.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'student', 'Alice', 'Anderson'),
('bob.martinez@student.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'student', 'Bob', 'Martinez'),
('carol.garcia@student.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'student', 'Carol', 'Garcia'),
('david.rodriguez@student.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'student', 'David', 'Rodriguez'),
('emma.lee@student.edu', '$2b$10$rKZvVqJh8GX7HvJQKZ5zPeYQYxN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'student', 'Emma', 'Lee');

-- ============================================
-- FACULTY
-- ============================================
INSERT INTO faculty (user_id, faculty_id, department_id, designation, specialization, office_location) VALUES
(3, 'FAC001', 1, 'Professor', 'Artificial Intelligence and Machine Learning', 'CS Building, Room 301'),
(4, 'FAC002', 1, 'Associate Professor', 'Database Systems and Data Science', 'CS Building, Room 305'),
(5, 'FAC003', 2, 'Professor', 'Applied Mathematics and Statistics', 'Math Building, Room 201'),
(6, 'FAC004', 3, 'Assistant Professor', 'Quantum Physics', 'Physics Building, Room 401'),
(7, 'FAC005', 5, 'Associate Professor', 'Molecular Biology', 'Biology Building, Room 105');

-- ============================================
-- STUDENTS
-- ============================================
INSERT INTO students (user_id, student_id, department_id, enrollment_year, current_semester) VALUES
(8, 'STU2023001', 1, 2023, 3),
(9, 'STU2023002', 1, 2023, 3),
(10, 'STU2024001', 2, 2024, 1),
(11, 'STU2024002', 1, 2024, 1),
(12, 'STU2023003', 3, 2023, 3);

-- ============================================
-- COURSES
-- ============================================

-- Computer Science Courses
INSERT INTO courses (course_code, course_name, department_id, credits, description, course_level) VALUES
('CS101', 'Introduction to Programming', 1, 3, 'Fundamentals of programming using Python. Topics include variables, control structures, functions, and basic data structures.', 'undergraduate'),
('CS201', 'Data Structures and Algorithms', 1, 4, 'Study of fundamental data structures and algorithms. Topics include arrays, linked lists, trees, graphs, sorting, and searching.', 'undergraduate'),
('CS202', 'Database Management Systems', 1, 3, 'Introduction to database concepts, SQL, relational database design, normalization, and transaction management.', 'undergraduate'),
('CS301', 'Operating Systems', 1, 4, 'Concepts of operating systems including process management, memory management, file systems, and concurrency.', 'undergraduate'),
('CS302', 'Computer Networks', 1, 3, 'Introduction to computer networks, protocols, network architecture, and internet technologies.', 'undergraduate'),
('CS401', 'Artificial Intelligence', 1, 3, 'Introduction to AI concepts including search algorithms, knowledge representation, machine learning basics.', 'undergraduate'),
('CS402', 'Machine Learning', 1, 4, 'Advanced machine learning techniques including supervised and unsupervised learning, neural networks, and deep learning.', 'graduate');

-- Mathematics Courses
INSERT INTO courses (course_code, course_name, department_id, credits, description, course_level) VALUES
('MATH101', 'Calculus I', 2, 4, 'Limits, continuity, derivatives, and applications of derivatives.', 'undergraduate'),
('MATH102', 'Calculus II', 2, 4, 'Integration techniques, applications of integrals, sequences and series.', 'undergraduate'),
('MATH201', 'Linear Algebra', 2, 3, 'Vector spaces, matrices, determinants, eigenvalues, and linear transformations.', 'undergraduate'),
('MATH301', 'Probability and Statistics', 2, 3, 'Probability theory, random variables, distributions, hypothesis testing, and statistical inference.', 'undergraduate');

-- Physics Courses
INSERT INTO courses (course_code, course_name, department_id, credits, description, course_level) VALUES
('PHYS101', 'Physics I: Mechanics', 3, 4, 'Kinematics, dynamics, work and energy, momentum, and rotational motion.', 'undergraduate'),
('PHYS102', 'Physics II: Electricity and Magnetism', 3, 4, 'Electric fields, magnetic fields, circuits, and electromagnetic waves.', 'undergraduate');

-- Biology Courses
INSERT INTO courses (course_code, course_name, department_id, credits, description, course_level) VALUES
('BIO101', 'General Biology', 5, 4, 'Introduction to biological concepts including cell structure, genetics, evolution, and ecology.', 'undergraduate'),
('BIO201', 'Molecular Biology', 5, 3, 'Study of biological molecules, DNA replication, transcription, translation, and gene regulation.', 'undergraduate');

-- ============================================
-- PREREQUISITES
-- ============================================
INSERT INTO prerequisites (course_id, prerequisite_course_id, minimum_grade) VALUES
-- CS Prerequisites
((SELECT id FROM courses WHERE course_code = 'CS201'), (SELECT id FROM courses WHERE course_code = 'CS101'), 'C'),
((SELECT id FROM courses WHERE course_code = 'CS202'), (SELECT id FROM courses WHERE course_code = 'CS101'), 'C'),
((SELECT id FROM courses WHERE course_code = 'CS301'), (SELECT id FROM courses WHERE course_code = 'CS201'), 'C'),
((SELECT id FROM courses WHERE course_code = 'CS302'), (SELECT id FROM courses WHERE course_code = 'CS201'), 'C'),
((SELECT id FROM courses WHERE course_code = 'CS401'), (SELECT id FROM courses WHERE course_code = 'CS201'), 'B'),
((SELECT id FROM courses WHERE course_code = 'CS402'), (SELECT id FROM courses WHERE course_code = 'CS401'), 'B'),

-- Math Prerequisites
((SELECT id FROM courses WHERE course_code = 'MATH102'), (SELECT id FROM courses WHERE course_code = 'MATH101'), 'C'),
((SELECT id FROM courses WHERE course_code = 'MATH301'), (SELECT id FROM courses WHERE course_code = 'MATH102'), 'C'),

-- Physics Prerequisites
((SELECT id FROM courses WHERE course_code = 'PHYS102'), (SELECT id FROM courses WHERE course_code = 'PHYS101'), 'C'),

-- Biology Prerequisites
((SELECT id FROM courses WHERE course_code = 'BIO201'), (SELECT id FROM courses WHERE course_code = 'BIO101'), 'C');

-- ============================================
-- COURSE OFFERINGS (Spring 2026 Semester)
-- ============================================
INSERT INTO course_offerings (course_id, faculty_id, semester, academic_year, section, max_capacity, room_number, schedule_days, start_time, end_time, registration_start_date, registration_end_date, add_drop_deadline) VALUES
-- CS Courses
((SELECT id FROM courses WHERE course_code = 'CS101'), 1, 'Spring', 2026, 'A', 40, 'CS-101', 'MWF', '09:00', '09:50', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'CS101'), 1, 'Spring', 2026, 'B', 40, 'CS-101', 'TTh', '10:00', '11:15', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'CS201'), 1, 'Spring', 2026, 'A', 35, 'CS-201', 'MWF', '11:00', '11:50', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'CS202'), 2, 'Spring', 2026, 'A', 30, 'CS-202', 'TTh', '13:00', '14:15', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'CS301'), 1, 'Spring', 2026, 'A', 30, 'CS-301', 'MWF', '14:00', '14:50', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'CS302'), 2, 'Spring', 2026, 'A', 30, 'CS-302', 'TTh', '15:00', '16:15', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'CS401'), 1, 'Spring', 2026, 'A', 25, 'CS-401', 'MW', '16:00', '17:15', '2026-01-05', '2026-01-20', '2026-02-01'),

-- Math Courses
((SELECT id FROM courses WHERE course_code = 'MATH101'), 3, 'Spring', 2026, 'A', 45, 'MATH-101', 'MWF', '09:00', '09:50', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'MATH101'), 3, 'Spring', 2026, 'B', 45, 'MATH-102', 'TTh', '11:00', '12:15', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'MATH102'), 3, 'Spring', 2026, 'A', 40, 'MATH-201', 'MWF', '10:00', '10:50', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'MATH201'), 3, 'Spring', 2026, 'A', 35, 'MATH-202', 'TTh', '13:00', '14:15', '2026-01-05', '2026-01-20', '2026-02-01'),

-- Physics Courses
((SELECT id FROM courses WHERE course_code = 'PHYS101'), 4, 'Spring', 2026, 'A', 40, 'PHYS-101', 'MWF', '11:00', '11:50', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'PHYS102'), 4, 'Spring', 2026, 'A', 35, 'PHYS-102', 'TTh', '14:00', '15:15', '2026-01-05', '2026-01-20', '2026-02-01'),

-- Biology Courses
((SELECT id FROM courses WHERE course_code = 'BIO101'), 5, 'Spring', 2026, 'A', 40, 'BIO-101', 'MWF', '13:00', '13:50', '2026-01-05', '2026-01-20', '2026-02-01'),
((SELECT id FROM courses WHERE course_code = 'BIO201'), 5, 'Spring', 2026, 'A', 30, 'BIO-201', 'TTh', '10:00', '11:15', '2026-01-05', '2026-01-20', '2026-02-01');

-- ============================================
-- SAMPLE ENROLLMENTS
-- ============================================

-- Student 1 (Alice Anderson) - CS Major, Semester 3
INSERT INTO enrollments (student_id, course_offering_id, status) VALUES
(1, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'CS201') AND section = 'A'), 'enrolled'),
(1, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'CS202') AND section = 'A'), 'enrolled'),
(1, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'MATH201') AND section = 'A'), 'enrolled');

-- Student 2 (Bob Martinez) - CS Major, Semester 3
INSERT INTO enrollments (student_id, course_offering_id, status) VALUES
(2, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'CS201') AND section = 'A'), 'enrolled'),
(2, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'MATH201') AND section = 'A'), 'enrolled');

-- Student 3 (Carol Garcia) - Math Major, Semester 1
INSERT INTO enrollments (student_id, course_offering_id, status) VALUES
(3, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'MATH101') AND section = 'A'), 'enrolled'),
(3, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'CS101') AND section = 'A'), 'enrolled');

-- ============================================
-- SAMPLE COMPLETED COURSES WITH GRADES (Previous Semester)
-- ============================================

-- Add Fall 2025 course offerings for completed courses
INSERT INTO course_offerings (course_id, faculty_id, semester, academic_year, section, max_capacity, room_number, schedule_days, start_time, end_time, status) VALUES
((SELECT id FROM courses WHERE course_code = 'CS101'), 1, 'Fall', 2025, 'A', 40, 'CS-101', 'MWF', '09:00', '09:50', 'completed'),
((SELECT id FROM courses WHERE course_code = 'MATH101'), 3, 'Fall', 2025, 'A', 45, 'MATH-101', 'MWF', '10:00', '10:50', 'completed');

-- Completed enrollments with grades
INSERT INTO enrollments (student_id, course_offering_id, status, grade, grade_points, is_grade_published) VALUES
(1, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'CS101') AND semester = 'Fall' AND academic_year = 2025), 'completed', 'A', 4.0, true),
(1, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'MATH101') AND semester = 'Fall' AND academic_year = 2025), 'completed', 'B+', 3.3, true),
(2, (SELECT id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE course_code = 'CS101') AND semester = 'Fall' AND academic_year = 2025), 'completed', 'A-', 3.7, true);

-- Update student GPAs based on completed courses
UPDATE students SET 
    total_credits_completed = 7,
    cumulative_gpa = 3.65
WHERE id = 1;

UPDATE students SET 
    total_credits_completed = 3,
    cumulative_gpa = 3.7
WHERE id = 2;

-- ============================================
-- SAMPLE NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, type, subject, message) VALUES
(8, 'registration', 'Registration Confirmation', 'You have successfully registered for CS201 - Data Structures and Algorithms'),
(8, 'registration', 'Registration Confirmation', 'You have successfully registered for CS202 - Database Management Systems'),
(9, 'registration', 'Registration Confirmation', 'You have successfully registered for CS201 - Data Structures and Algorithms');

COMMIT;
