/**
 * Direct Database Setup Script — with Demo Courses
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
    console.log('Connected to database.');
    try {
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

        console.log('Creating tables...');
        await client.query(`CREATE TABLE departments (id SERIAL PRIMARY KEY, code VARCHAR(10) UNIQUE NOT NULL, name VARCHAR(100) NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL CHECK (role IN ('student','faculty','admin')), first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, is_active BOOLEAN DEFAULT true, last_login TIMESTAMP, password_reset_token VARCHAR(255), password_reset_expires TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE students (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, student_id VARCHAR(20) UNIQUE NOT NULL, department_id INTEGER REFERENCES departments(id), enrollment_year INTEGER NOT NULL, current_semester INTEGER DEFAULT 1, total_credits_completed DECIMAL(5,2) DEFAULT 0, cumulative_gpa DECIMAL(3,2) DEFAULT 0, academic_standing VARCHAR(50) DEFAULT 'Good Standing', max_credits_per_semester INTEGER DEFAULT 18, min_credits_per_semester INTEGER DEFAULT 12, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE faculty (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, faculty_id VARCHAR(20) UNIQUE NOT NULL, department_id INTEGER REFERENCES departments(id), designation VARCHAR(100), specialization TEXT, office_location VARCHAR(100), office_hours TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE courses (id SERIAL PRIMARY KEY, course_code VARCHAR(20) UNIQUE NOT NULL, course_name VARCHAR(200) NOT NULL, department_id INTEGER REFERENCES departments(id), credits INTEGER NOT NULL, description TEXT, course_level VARCHAR(20) CHECK (course_level IN ('undergraduate','graduate')), is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE course_offerings (id SERIAL PRIMARY KEY, course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE, faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL, semester VARCHAR(20) NOT NULL, academic_year INTEGER NOT NULL, section VARCHAR(10) NOT NULL, max_capacity INTEGER NOT NULL, current_enrollment INTEGER DEFAULT 0, room_number VARCHAR(50), schedule_days VARCHAR(50), start_time TIME, end_time TIME, registration_start_date DATE, registration_end_date DATE, add_drop_deadline DATE, status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','cancelled','completed')), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(course_id, semester, academic_year, section))`);
        await client.query(`CREATE TABLE prerequisites (id SERIAL PRIMARY KEY, course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE, prerequisite_course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE, is_corequisite BOOLEAN DEFAULT false, minimum_grade VARCHAR(2) DEFAULT 'D', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(course_id, prerequisite_course_id))`);
        await client.query(`CREATE TABLE enrollments (id SERIAL PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE, course_offering_id INTEGER NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE, enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled','dropped','completed','withdrawn')), dropped_date TIMESTAMP, grade VARCHAR(2), grade_points DECIMAL(3,2), is_grade_published BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(student_id, course_offering_id))`);
        await client.query(`CREATE TABLE waitlists (id SERIAL PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE, course_offering_id INTEGER NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE, position INTEGER NOT NULL, added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting','enrolled','expired','removed')), notified_date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(student_id, course_offering_id))`);
        await client.query(`CREATE TABLE grades (id SERIAL PRIMARY KEY, enrollment_id INTEGER UNIQUE NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE, letter_grade VARCHAR(2) NOT NULL, grade_points DECIMAL(3,2) NOT NULL, percentage DECIMAL(5,2), submitted_by INTEGER REFERENCES faculty(id), submitted_date TIMESTAMP, approved_by INTEGER REFERENCES users(id), approved_date TIMESTAMP, is_approved BOOLEAN DEFAULT false, is_published BOOLEAN DEFAULT false, published_date TIMESTAMP, comments TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE notifications (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, type VARCHAR(50) NOT NULL, subject VARCHAR(255) NOT NULL, message TEXT NOT NULL, is_read BOOLEAN DEFAULT false, is_email_sent BOOLEAN DEFAULT false, email_sent_date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE audit_logs (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, action VARCHAR(100) NOT NULL, entity_type VARCHAR(50) NOT NULL, entity_id INTEGER, old_values JSONB, new_values JSONB, ip_address VARCHAR(45), user_agent TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        console.log('Tables created.');

        // Departments
        const depts = [
            ['CSE','Computer Science & Engineering','Dept of CSE'],
            ['IT','Information Technology','Dept of IT'],
            ['AIML','CS with AI & ML','Dept of AIML'],
            ['AIDS','AI & Data Science','Dept of AIDS'],
            ['CSAI','CS with AI','Dept of CSAI'],
            ['MECH','Mechanical Engineering','Dept of Mech'],
            ['CIVIL','Civil Engineering','Dept of Civil'],
            ['EXTC','Electronics & Telecom','Dept of EXTC'],
            ['CHEM','Chemical Engineering','Dept of Chem'],
            ['ETRX','Electronics Engineering','Dept of ETRX'],
            ['ECS','Electronics & CS','Dept of ECS'],
            ['BIOTECH','Biotechnology','Dept of Biotech'],
        ];
        for (const [code, name, desc] of depts) {
            await client.query('INSERT INTO departments(code,name,description) VALUES($1,$2,$3)', [code, name, desc]);
        }
        console.log('Departments seeded.');

        const password = await bcrypt.hash('Password@123', 10);

        // Admin
        await client.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES('admin@campusconnect.edu',$1,'admin','Admin','User')`, [password]);

        // Faculty
        const f1 = await client.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES('dr.sharma@campusconnect.edu',$1,'faculty','Dr. Rajesh','Sharma') RETURNING id`, [password]);
        const f2 = await client.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES('prof.mehra@campusconnect.edu',$1,'faculty','Prof. Neha','Mehra') RETURNING id`, [password]);
        await client.query(`INSERT INTO faculty(user_id,faculty_id,department_id,designation,specialization) VALUES($1,'FAC001',1,'Associate Professor','Algorithms & Data Structures')`, [f1.rows[0].id]);
        await client.query(`INSERT INTO faculty(user_id,faculty_id,department_id,designation,specialization) VALUES($1,'FAC002',3,'Assistant Professor','Machine Learning & AI')`, [f2.rows[0].id]);
        const fac1Id = (await client.query('SELECT id FROM faculty WHERE faculty_id=$1', ['FAC001'])).rows[0].id;
        const fac2Id = (await client.query('SELECT id FROM faculty WHERE faculty_id=$1', ['FAC002'])).rows[0].id;

        // Student (Tanishq - the actual user)
        const s1 = await client.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES('alice.anderson@student.edu',$1,'student','Alice','Anderson') RETURNING id`, [password]);
        await client.query(`INSERT INTO students(user_id,student_id,department_id,enrollment_year,current_semester) VALUES($1,'STU2023001',1,2023,5)`, [s1.rows[0].id]);
        const stu1Id = (await client.query('SELECT id FROM students WHERE student_id=$1', ['STU2023001'])).rows[0].id;

        console.log('Users created.');

        // Courses
        const courses = [
            ['CS201','Data Structures & Algorithms',1,4,'Fundamental data structures: arrays, linked lists, trees, graphs. Algorithm analysis and design.','undergraduate'],
            ['CS301','Database Management Systems',1,4,'Relational model, SQL, normalization, transactions, indexing.','undergraduate'],
            ['CS401','Machine Learning',3,4,'Supervised & unsupervised learning, neural networks, model evaluation.','undergraduate'],
            ['CS202','Object Oriented Programming',1,3,'OOP concepts using Java: classes, inheritance, polymorphism, design patterns.','undergraduate'],
            ['CS302','Computer Networks',1,3,'Network layers, TCP/IP, routing, HTTP, socket programming.','undergraduate'],
            ['CS501','Deep Learning',3,4,'CNNs, RNNs, Transformers, PyTorch. Project-based course.','graduate'],
            ['IT301','Web Technologies',2,3,'HTML, CSS, JavaScript, React, Node.js, REST APIs.','undergraduate'],
            ['IT401','Cloud Computing',2,3,'AWS, Azure, Docker, Kubernetes, microservices architecture.','undergraduate'],
            ['AI301','Natural Language Processing',3,4,'Text processing, transformers, BERT, GPT. Real-world NLP pipelines.','undergraduate'],
            ['CS601','Software Engineering',1,3,'SDLC, Agile, design patterns, testing, DevOps basics.','undergraduate'],
        ];
        for (const [code, name, deptId, credits, desc, level] of courses) {
            await client.query('INSERT INTO courses(course_code,course_name,department_id,credits,description,course_level) VALUES($1,$2,$3,$4,$5,$6)', [code, name, deptId, credits, desc, level]);
        }
        console.log('Courses created.');

        // Course Offerings (Spring 2026)
        const getCourseId = async (code) => (await client.query('SELECT id FROM courses WHERE course_code=$1', [code])).rows[0].id;

        const offerings = [
            [await getCourseId('CS201'), fac1Id, 'Spring', 2026, 'A', 60, 'LH-301', 'Mon,Wed,Fri', '09:00', '10:00'],
            [await getCourseId('CS301'), fac1Id, 'Spring', 2026, 'A', 55, 'LH-302', 'Tue,Thu', '10:30', '12:00'],
            [await getCourseId('CS401'), fac2Id, 'Spring', 2026, 'A', 50, 'LH-401', 'Mon,Wed', '14:00', '15:30'],
            [await getCourseId('CS202'), fac1Id, 'Spring', 2026, 'B', 60, 'LH-201', 'Tue,Thu,Sat', '08:00', '09:00'],
            [await getCourseId('CS302'), fac2Id, 'Spring', 2026, 'A', 45, 'LH-303', 'Mon,Wed,Fri', '11:00', '12:00'],
            [await getCourseId('CS501'), fac2Id, 'Spring', 2026, 'A', 30, 'LH-501', 'Tue,Thu', '15:00', '16:30'],
            [await getCourseId('IT301'), fac1Id, 'Spring', 2026, 'A', 60, 'LH-202', 'Mon,Wed,Fri', '13:00', '14:00'],
            [await getCourseId('IT401'), fac2Id, 'Spring', 2026, 'A', 40, 'LH-402', 'Tue,Thu', '09:00', '10:30'],
            [await getCourseId('AI301'), fac2Id, 'Spring', 2026, 'A', 35, 'LH-403', 'Mon,Wed', '16:00', '17:30'],
            [await getCourseId('CS601'), fac1Id, 'Spring', 2026, 'A', 55, 'LH-304', 'Fri', '14:00', '17:00'],
        ];
        const offeringIds = [];
        for (const [cid, fid, sem, yr, sec, cap, room, days, st, et] of offerings) {
            const res = await client.query(
                'INSERT INTO course_offerings(course_id,faculty_id,semester,academic_year,section,max_capacity,room_number,schedule_days,start_time,end_time) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id',
                [cid, fid, sem, yr, sec, cap, room, days, st, et]
            );
            offeringIds.push(res.rows[0].id);
        }
        console.log('Course offerings created.');

        // Enroll Alice in 3 courses so dashboard is not empty
        for (let i = 0; i < 3; i++) {
            await client.query(
                'INSERT INTO enrollments(student_id,course_offering_id,status) VALUES($1,$2,$2) ON CONFLICT DO NOTHING',
                [stu1Id, offeringIds[i], 'enrolled']
            );
            await client.query('UPDATE course_offerings SET current_enrollment=current_enrollment+1 WHERE id=$1', [offeringIds[i]]);
        }
        // Fix enrollment insert (status param issue)
        await client.query('DELETE FROM enrollments');
        await client.query('UPDATE course_offerings SET current_enrollment=0');
        for (let i = 0; i < 3; i++) {
            await client.query(
                'INSERT INTO enrollments(student_id,course_offering_id,status) VALUES($1,$2,$3)',
                [stu1Id, offeringIds[i], 'enrolled']
            );
            await client.query('UPDATE course_offerings SET current_enrollment=current_enrollment+1 WHERE id=$1', [offeringIds[i]]);
        }

        console.log('\n✅ Setup complete!\n');
        console.log('Credentials (password: Password@123)');
        console.log('  Student: alice.anderson@student.edu');
        console.log('  Faculty: dr.sharma@campusconnect.edu');
        console.log('  Admin:   admin@campusconnect.edu');
    } catch (err) {
        console.error('Setup failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

run();
