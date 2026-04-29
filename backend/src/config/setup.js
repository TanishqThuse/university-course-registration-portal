/**
 * CampusConnect Database Setup Script
 * Run with: npm run setup
 *
 * Credentials after setup (all passwords: Password@123):
 *   Admin:   admin@university.edu
 *   Faculty: john.smith@university.edu
 *   Faculty: dr.sharma@campusconnect.edu
 *   Student: alice.anderson@student.edu
 *   Student: bob.patel@student.edu
 *   Student: charlie.kumar@student.edu
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
    console.log('✅ Connected to database:', process.env.DB_NAME || 'university_system');

    try {
        console.log('\n🗑️  Dropping old tables...');
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
        console.log('✅ Old tables dropped.');

        console.log('\n📋 Creating tables...');
        await client.query(`
            CREATE TABLE departments (
                id SERIAL PRIMARY KEY,
                code VARCHAR(10) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('student','faculty','admin')),
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                last_login TIMESTAMP,
                password_reset_token VARCHAR(255),
                password_reset_expires TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

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
            )`);

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
            )`);

        await client.query(`
            CREATE TABLE courses (
                id SERIAL PRIMARY KEY,
                course_code VARCHAR(20) UNIQUE NOT NULL,
                course_name VARCHAR(200) NOT NULL,
                department_id INTEGER REFERENCES departments(id),
                credits INTEGER NOT NULL DEFAULT 3,
                description TEXT,
                course_level VARCHAR(20) DEFAULT 'undergraduate'
                    CHECK (course_level IN ('undergraduate','graduate','postgraduate')),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

        await client.query(`
            CREATE TABLE course_offerings (
                id SERIAL PRIMARY KEY,
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL,
                semester VARCHAR(20) NOT NULL,
                academic_year INTEGER NOT NULL,
                section VARCHAR(10) NOT NULL DEFAULT 'A',
                max_capacity INTEGER NOT NULL DEFAULT 60,
                current_enrollment INTEGER DEFAULT 0,
                room_number VARCHAR(50),
                schedule_days VARCHAR(100),
                start_time TIME,
                end_time TIME,
                registration_start_date DATE,
                registration_end_date DATE,
                add_drop_deadline DATE,
                status VARCHAR(20) DEFAULT 'active'
                    CHECK (status IN ('active','cancelled','completed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(course_id, semester, academic_year, section)
            )`);

        await client.query(`
            CREATE TABLE prerequisites (
                id SERIAL PRIMARY KEY,
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                prerequisite_course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                is_corequisite BOOLEAN DEFAULT false,
                minimum_grade VARCHAR(2) DEFAULT 'D',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(course_id, prerequisite_course_id)
            )`);

        await client.query(`
            CREATE TABLE enrollments (
                id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                course_offering_id INTEGER NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
                enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'enrolled'
                    CHECK (status IN ('enrolled','dropped','completed','withdrawn')),
                dropped_date TIMESTAMP,
                grade VARCHAR(2),
                grade_points DECIMAL(3,2),
                is_grade_published BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, course_offering_id)
            )`);

        await client.query(`
            CREATE TABLE waitlists (
                id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                course_offering_id INTEGER NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
                position INTEGER NOT NULL,
                added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'waiting'
                    CHECK (status IN ('waiting','enrolled','expired','removed')),
                notified_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, course_offering_id)
            )`);

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
            )`);

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
            )`);

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
            )`);

        console.log('✅ Tables created.');

        // ─── Departments ────────────────────────────────────────────────────
        console.log('\n🏛️  Seeding departments...');
        const deptData = [
            ['CSE',     'Computer Science & Engineering', 'Department of Computer Science & Engineering'],
            ['IT',      'Information Technology',         'Department of Information Technology'],
            ['AIML',    'CS with AI & ML',                'Department of AI & Machine Learning'],
            ['AIDS',    'AI & Data Science',              'Department of AI & Data Science'],
            ['CSAI',    'CS with AI',                     'Department of CS with AI'],
            ['MECH',    'Mechanical Engineering',         'Department of Mechanical Engineering'],
            ['CIVIL',   'Civil Engineering',              'Department of Civil Engineering'],
            ['EXTC',    'Electronics & Telecom',          'Department of Electronics & Telecom'],
            ['ECS',     'Electronics & CS',               'Department of Electronics & CS'],
            ['BIOTECH', 'Biotechnology',                  'Department of Biotechnology'],
        ];
        for (const [code, name, desc] of deptData) {
            await client.query(
                'INSERT INTO departments(code,name,description) VALUES($1,$2,$3)',
                [code, name, desc]
            );
        }
        const cseId  = (await client.query("SELECT id FROM departments WHERE code='CSE'")).rows[0].id;
        const itId   = (await client.query("SELECT id FROM departments WHERE code='IT'")).rows[0].id;
        const aimlId = (await client.query("SELECT id FROM departments WHERE code='AIML'")).rows[0].id;
        const mechId = (await client.query("SELECT id FROM departments WHERE code='MECH'")).rows[0].id;
        console.log('✅ Departments seeded.');

        // ─── Users ──────────────────────────────────────────────────────────
        console.log('\n👤 Creating users...');
        const pwd = await bcrypt.hash('Password@123', 10);

        // Admin
        await client.query(
            `INSERT INTO users(email,password_hash,role,first_name,last_name)
             VALUES('admin@university.edu',$1,'admin','Admin','User')`, [pwd]);
        const adminUserId = (await client.query(
            "SELECT id FROM users WHERE email='admin@university.edu'")).rows[0].id;

        // Faculty 1 — the credentials the user shared
        const fUser1 = await client.query(
            `INSERT INTO users(email,password_hash,role,first_name,last_name)
             VALUES('john.smith@university.edu',$1,'faculty','John','Smith') RETURNING id`, [pwd]);
        // Faculty 2 — legacy / backup
        const fUser2 = await client.query(
            `INSERT INTO users(email,password_hash,role,first_name,last_name)
             VALUES('dr.sharma@campusconnect.edu',$1,'faculty','Dr. Rajesh','Sharma') RETURNING id`, [pwd]);

        await client.query(
            `INSERT INTO faculty(user_id,faculty_id,department_id,designation,specialization)
             VALUES($1,'FAC001',$2,'Associate Professor','Algorithms & Data Structures')`,
            [fUser1.rows[0].id, cseId]);
        await client.query(
            `INSERT INTO faculty(user_id,faculty_id,department_id,designation,specialization)
             VALUES($1,'FAC002',$2,'Assistant Professor','Machine Learning & AI')`,
            [fUser2.rows[0].id, aimlId]);

        const fac1Id = (await client.query("SELECT id FROM faculty WHERE faculty_id='FAC001'")).rows[0].id;
        const fac2Id = (await client.query("SELECT id FROM faculty WHERE faculty_id='FAC002'")).rows[0].id;

        // Students
        const sUser1 = await client.query(
            `INSERT INTO users(email,password_hash,role,first_name,last_name)
             VALUES('alice.anderson@student.edu',$1,'student','Alice','Anderson') RETURNING id`, [pwd]);
        const sUser2 = await client.query(
            `INSERT INTO users(email,password_hash,role,first_name,last_name)
             VALUES('bob.patel@student.edu',$1,'student','Bob','Patel') RETURNING id`, [pwd]);
        const sUser3 = await client.query(
            `INSERT INTO users(email,password_hash,role,first_name,last_name)
             VALUES('charlie.kumar@student.edu',$1,'student','Charlie','Kumar') RETURNING id`, [pwd]);
        const sUser4 = await client.query(
            `INSERT INTO users(email,password_hash,role,first_name,last_name)
             VALUES('diana.sharma@student.edu',$1,'student','Diana','Sharma') RETURNING id`, [pwd]);

        await client.query(
            `INSERT INTO students(user_id,student_id,department_id,enrollment_year,current_semester)
             VALUES($1,'STU2023001',$2,2023,5)`, [sUser1.rows[0].id, cseId]);
        await client.query(
            `INSERT INTO students(user_id,student_id,department_id,enrollment_year,current_semester)
             VALUES($1,'STU2023002',$2,2023,5)`, [sUser2.rows[0].id, itId]);
        await client.query(
            `INSERT INTO students(user_id,student_id,department_id,enrollment_year,current_semester)
             VALUES($1,'STU2023003',$2,2023,3)`, [sUser3.rows[0].id, aimlId]);
        await client.query(
            `INSERT INTO students(user_id,student_id,department_id,enrollment_year,current_semester)
             VALUES($1,'STU2024001',$2,2024,1)`, [sUser4.rows[0].id, mechId]);

        const stu1Id = (await client.query("SELECT id FROM students WHERE student_id='STU2023001'")).rows[0].id;
        const stu2Id = (await client.query("SELECT id FROM students WHERE student_id='STU2023002'")).rows[0].id;
        const stu3Id = (await client.query("SELECT id FROM students WHERE student_id='STU2023003'")).rows[0].id;
        console.log('✅ Users created.');

        // ─── Courses ────────────────────────────────────────────────────────
        console.log('\n📚 Creating courses...');
        const courseDefs = [
            ['CS201', 'Data Structures & Algorithms',    cseId,  4, 'undergraduate', 'Arrays, linked lists, trees, graphs, algorithm analysis.'],
            ['CS301', 'Database Management Systems',     cseId,  4, 'undergraduate', 'Relational model, SQL, normalization, transactions.'],
            ['CS401', 'Machine Learning',                aimlId, 4, 'undergraduate', 'Supervised & unsupervised learning, neural networks.'],
            ['CS202', 'Object Oriented Programming',     cseId,  3, 'undergraduate', 'OOP concepts in Java: classes, inheritance, design patterns.'],
            ['CS302', 'Computer Networks',               cseId,  3, 'undergraduate', 'Network layers, TCP/IP, routing, HTTP, socket programming.'],
            ['CS501', 'Deep Learning',                   aimlId, 4, 'graduate',      'CNNs, RNNs, Transformers, PyTorch. Project-based course.'],
            ['IT301', 'Web Technologies',                itId,   3, 'undergraduate', 'HTML, CSS, JavaScript, React, Node.js, REST APIs.'],
            ['IT401', 'Cloud Computing',                 itId,   3, 'undergraduate', 'AWS, Azure, Docker, Kubernetes, microservices.'],
            ['AI301', 'Natural Language Processing',     aimlId, 4, 'undergraduate', 'Text processing, transformers, BERT, GPT.'],
            ['CS601', 'Software Engineering',            cseId,  3, 'undergraduate', 'SDLC, Agile, design patterns, testing, DevOps.'],
        ];
        for (const [code, name, deptId, credits, level, desc] of courseDefs) {
            await client.query(
                `INSERT INTO courses(course_code,course_name,department_id,credits,course_level,description)
                 VALUES($1,$2,$3,$4,$5,$6)`,
                [code, name, deptId, credits, level, desc]
            );
        }
        console.log('✅ Courses created.');

        // ─── Course Offerings (Spring 2026) ─────────────────────────────────
        console.log('\n📅 Creating Spring 2026 course offerings...');
        const getC = async (code) =>
            (await client.query('SELECT id FROM courses WHERE course_code=$1', [code])).rows[0].id;

        const offeringDefs = [
            [await getC('CS201'), fac1Id, 'Spring', 2026, 'A', 60, 'LH-301', 'Mon,Wed,Fri', '09:00', '10:00'],
            [await getC('CS301'), fac1Id, 'Spring', 2026, 'A', 55, 'LH-302', 'Tue,Thu',     '10:30', '12:00'],
            [await getC('CS401'), fac2Id, 'Spring', 2026, 'A', 50, 'LH-401', 'Mon,Wed',     '14:00', '15:30'],
            [await getC('CS202'), fac1Id, 'Spring', 2026, 'B', 60, 'LH-201', 'Tue,Thu,Sat', '08:00', '09:00'],
            [await getC('CS302'), fac2Id, 'Spring', 2026, 'A', 45, 'LH-303', 'Mon,Wed,Fri', '11:00', '12:00'],
            [await getC('CS501'), fac2Id, 'Spring', 2026, 'A', 30, 'LH-501', 'Tue,Thu',     '15:00', '16:30'],
            [await getC('IT301'), fac1Id, 'Spring', 2026, 'A', 60, 'LH-202', 'Mon,Wed,Fri', '13:00', '14:00'],
            [await getC('IT401'), fac2Id, 'Spring', 2026, 'A', 40, 'LH-402', 'Tue,Thu',     '09:00', '10:30'],
            [await getC('AI301'), fac2Id, 'Spring', 2026, 'A', 35, 'LH-403', 'Mon,Wed',     '16:00', '17:30'],
            [await getC('CS601'), fac1Id, 'Spring', 2026, 'A', 55, 'LH-304', 'Fri',         '14:00', '17:00'],
        ];

        const offeringIds = [];
        for (const [cid, fid, sem, yr, sec, cap, room, days, st, et] of offeringDefs) {
            const r = await client.query(
                `INSERT INTO course_offerings
                 (course_id,faculty_id,semester,academic_year,section,max_capacity,room_number,schedule_days,start_time,end_time)
                 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
                [cid, fid, sem, yr, sec, cap, room, days, st, et]
            );
            offeringIds.push(r.rows[0].id);
        }
        console.log(`✅ ${offeringIds.length} course offerings created.`);

        // ─── Enrollments + Published Grades for Alice ────────────────────────
        console.log('\n📝 Enrolling students and adding grades...');

        const completedGrades = [
            { grade: 'A',  pts: 4.0, pct: 93 },
            { grade: 'B+', pts: 3.3, pct: 86 },
            { grade: 'A-', pts: 3.7, pct: 90 },
        ];

        // Alice: 3 completed + graded courses
        for (let i = 0; i < 3; i++) {
            const g = completedGrades[i];
            const enr = await client.query(
                `INSERT INTO enrollments(student_id,course_offering_id,status,grade,grade_points,is_grade_published)
                 VALUES($1,$2,'completed',$3,$4,true) RETURNING id`,
                [stu1Id, offeringIds[i], g.grade, g.pts]
            );
            await client.query(
                `INSERT INTO grades(enrollment_id,letter_grade,grade_points,percentage,
                  submitted_by,submitted_date,is_approved,is_published,published_date,approved_by,approved_date)
                 VALUES($1,$2,$3,$4,$5,NOW(),true,true,NOW(),$6,NOW())`,
                [enr.rows[0].id, g.grade, g.pts, g.pct, fac1Id, adminUserId]
            );
            await client.query(
                'UPDATE course_offerings SET current_enrollment=current_enrollment+1 WHERE id=$1',
                [offeringIds[i]]
            );
        }

        // Alice: 2 currently enrolled (no grade yet) — shows on My Schedule
        for (let i = 3; i < 5; i++) {
            await client.query(
                `INSERT INTO enrollments(student_id,course_offering_id,status)
                 VALUES($1,$2,'enrolled')`,
                [stu1Id, offeringIds[i]]
            );
            await client.query(
                'UPDATE course_offerings SET current_enrollment=current_enrollment+1 WHERE id=$1',
                [offeringIds[i]]
            );
        }

        // Bob: 2 enrolled courses
        for (const i of [2, 4]) {
            await client.query(
                `INSERT INTO enrollments(student_id,course_offering_id,status)
                 VALUES($1,$2,'enrolled')`,
                [stu2Id, offeringIds[i]]
            );
            await client.query(
                'UPDATE course_offerings SET current_enrollment=current_enrollment+1 WHERE id=$1',
                [offeringIds[i]]
            );
        }

        // Charlie: 1 enrolled
        await client.query(
            `INSERT INTO enrollments(student_id,course_offering_id,status) VALUES($1,$2,'enrolled')`,
            [stu3Id, offeringIds[1]]
        );
        await client.query(
            'UPDATE course_offerings SET current_enrollment=current_enrollment+1 WHERE id=$1',
            [offeringIds[1]]
        );

        // Update Alice's GPA in student record
        await client.query(
            `UPDATE students
             SET cumulative_gpa=3.67, total_credits_completed=12, academic_standing='Dean''s List'
             WHERE id=$1`,
            [stu1Id]
        );
        console.log('✅ Enrollments and grades seeded.');

        // ─── Summary ────────────────────────────────────────────────────────
        console.log('\n' + '='.repeat(55));
        console.log('✅  SETUP COMPLETE!');
        console.log('='.repeat(55));
        console.log('\n📋 Login credentials (password for ALL: Password@123)\n');
        console.log('  🔴 Admin  :  admin@university.edu');
        console.log('  🟢 Faculty:  john.smith@university.edu');
        console.log('  🟢 Faculty:  dr.sharma@campusconnect.edu');
        console.log('  🔵 Student:  alice.anderson@student.edu   ← has grades & schedule');
        console.log('  🔵 Student:  bob.patel@student.edu');
        console.log('  🔵 Student:  charlie.kumar@student.edu');
        console.log('  🔵 Student:  diana.sharma@student.edu');
        console.log('\n📌 App runs on:  http://localhost:3001');
        console.log('📌 Backend API:  http://localhost:5000/api');
        console.log('\n📌 Course Registration: use Semester=Spring, Year=2026');
        console.log('='.repeat(55) + '\n');

    } catch (err) {
        console.error('\n❌ Setup FAILED:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

run();
