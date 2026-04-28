/**
 * Direct Database Setup Script
 * Creates all tables and seeds initial data using individual queries.
 * Run with: node src/config/setup.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'university_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

const run = async () => {
    const client = await pool.connect();
    console.log('Connected to database successfully.');

    try {
        // ── DROP TABLES ──────────────────────────────────────────────────────
        console.log('Dropping old tables...');
        const drops = [
            'DROP TABLE IF EXISTS audit_logs CASCADE',
            'DROP TABLE IF EXISTS notifications CASCADE',
            'DROP TABLE IF EXISTS grade_modifications CASCADE',
            'DROP TABLE IF EXISTS grades CASCADE',
            'DROP TABLE IF EXISTS waitlists CASCADE',
            'DROP TABLE IF EXISTS enrollments CASCADE',
            'DROP TABLE IF EXISTS prerequisites CASCADE',
            'DROP TABLE IF EXISTS course_offerings CASCADE',
            'DROP TABLE IF EXISTS courses CASCADE',
            'DROP TABLE IF EXISTS faculty CASCADE',
            'DROP TABLE IF EXISTS students CASCADE',
            'DROP TABLE IF EXISTS users CASCADE',
            'DROP TABLE IF EXISTS departments CASCADE',
        ];
        for (const q of drops) await client.query(q);
        console.log('Old tables dropped.');

        // ── CREATE TABLES ────────────────────────────────────────────────────
        console.log('Creating tables...');

        await client.query(`
            CREATE TABLE departments (
                id SERIAL PRIMARY KEY,
                code VARCHAR(10) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
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
            )
        `);

        await client.query(`
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
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
                schedule_days VARCHAR(50),
                start_time TIME,
                end_time TIME,
                registration_start_date DATE,
                registration_end_date DATE,
                add_drop_deadline DATE,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(course_id, semester, academic_year, section)
            )
        `);

        await client.query(`
            CREATE TABLE prerequisites (
                id SERIAL PRIMARY KEY,
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                prerequisite_course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                is_corequisite BOOLEAN DEFAULT false,
                minimum_grade VARCHAR(2) DEFAULT 'D',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(course_id, prerequisite_course_id)
            )
        `);

        await client.query(`
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
                UNIQUE(student_id, course_offering_id)
            )
        `);

        await client.query(`
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
                UNIQUE(student_id, course_offering_id)
            )
        `);

        await client.query(`
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
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
            )
        `);

        await client.query(`
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
            )
        `);

        console.log('All tables created successfully.');

        // ── SEED DEPARTMENTS ─────────────────────────────────────────────────
        console.log('Seeding departments...');
        const departments = [
            ['CSE', 'Computer Science & Engineering', 'Dept of Computer Science and Engineering'],
            ['IT', 'Information Technology', 'Dept of Information Technology'],
            ['AIML', 'CS with AI & ML', 'Dept of CS with Artificial Intelligence and Machine Learning'],
            ['AIDS', 'AI & Data Science', 'Dept of Artificial Intelligence and Data Science'],
            ['CSAI', 'CS with AI', 'Dept of Computer Science with Artificial Intelligence'],
            ['MECH', 'Mechanical Engineering', 'Dept of Mechanical Engineering'],
            ['CIVIL', 'Civil Engineering', 'Dept of Civil Engineering'],
            ['EXTC', 'Electronics & Telecom', 'Dept of Electronics and Telecommunication Engineering'],
            ['CHEM', 'Chemical Engineering', 'Dept of Chemical Engineering'],
            ['ETRX', 'Electronics Engineering', 'Dept of Electronics Engineering'],
            ['ECS', 'Electronics & Computer Science', 'Dept of Electronics and Computer Science'],
            ['BIOTECH', 'Biotechnology', 'Dept of Biotechnology'],
        ];
        for (const [code, name, desc] of departments) {
            await client.query(
                'INSERT INTO departments (code, name, description) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
                [code, name, desc]
            );
        }
        console.log('Departments seeded.');

        // ── SEED USERS ───────────────────────────────────────────────────────
        console.log('Creating test users...');
        const password = await bcrypt.hash('Password@123', 10);

        // Admin
        await client.query(
            `INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES ($1, $2, 'admin', 'System', 'Administrator') ON CONFLICT (email) DO NOTHING`,
            ['admin@university.edu', password]
        );

        // Faculty
        const facultyUser = await client.query(
            `INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES ($1, $2, 'faculty', 'John', 'Smith') ON CONFLICT (email) DO NOTHING RETURNING id`,
            ['john.smith@university.edu', password]
        );
        if (facultyUser.rows.length > 0) {
            await client.query(
                `INSERT INTO faculty (user_id, faculty_id, department_id) VALUES ($1, 'FAC001', 1) ON CONFLICT (faculty_id) DO NOTHING`,
                [facultyUser.rows[0].id]
            );
        }

        // Student
        const studentUser = await client.query(
            `INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES ($1, $2, 'student', 'Alice', 'Anderson') ON CONFLICT (email) DO NOTHING RETURNING id`,
            ['alice.anderson@student.edu', password]
        );
        if (studentUser.rows.length > 0) {
            await client.query(
                `INSERT INTO students (user_id, student_id, department_id, enrollment_year) VALUES ($1, 'STU2023001', 1, 2023) ON CONFLICT (student_id) DO NOTHING`,
                [studentUser.rows[0].id]
            );
        }

        console.log('Test users created.');
        console.log('\n✅ Setup complete! You can now start the server with: npm run dev');
        console.log('\nTest credentials (password: Password@123):');
        console.log('  Admin:   admin@university.edu');
        console.log('  Faculty: john.smith@university.edu');
        console.log('  Student: alice.anderson@student.edu');

    } catch (err) {
        console.error('\n❌ Setup failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

run();
