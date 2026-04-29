/**
 * University Course Registration and Result Management System
 * Main Server Entry Point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./src/utils/logger');
const { errorHandler } = require('./src/middleware/errorHandler');
const db = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const courseRoutes = require('./src/routes/course.routes');
const registrationRoutes = require('./src/routes/registration.routes');
const gradeRoutes = require('./src/routes/grade.routes');
const reportRoutes = require('./src/routes/report.routes');
const userRoutes = require('./src/routes/user.routes');
const notificationRoutes = require('./src/routes/notification.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests from any localhost port during development
        if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window (generous for development)
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// General rate limiting
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// ============================================
// DEV SEED ENDPOINT — seeds demo data on demand
// POST /api/seed  (no auth required, dev only)
// ============================================
app.get('/api/seed/status', async (req, res) => {
    try {
        // Check if course_offerings table exists and has data
        const check = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'course_offerings'
            ) as table_exists
        `);
        if (!check.rows[0].table_exists) {
            return res.json({ seeded: false, message: 'Tables not created yet' });
        }
        const count = await db.query('SELECT COUNT(*) as cnt FROM course_offerings');
        const offerCount = parseInt(count.rows[0].cnt);
        const userCount = (await db.query('SELECT COUNT(*) as cnt FROM users')).rows[0].cnt;
        res.json({ seeded: offerCount > 0, offerings: offerCount, users: parseInt(userCount) });
    } catch (err) {
        res.json({ seeded: false, error: err.message });
    }
});

app.post('/api/seed', async (req, res) => {
    const bcrypt = require('bcrypt');
    const client = await db.pool.connect();
    try {
        logger.info('🌱 Auto-seed triggered via API');

        // Drop & recreate tables
        const drops = [
            'DROP TABLE IF EXISTS audit_logs CASCADE',
            'DROP TABLE IF EXISTS notifications CASCADE',
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

        await client.query(`CREATE TABLE departments (id SERIAL PRIMARY KEY, code VARCHAR(10) UNIQUE NOT NULL, name VARCHAR(100) NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL CHECK (role IN ('student','faculty','admin')), first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, is_active BOOLEAN DEFAULT true, last_login TIMESTAMP, password_reset_token VARCHAR(255), password_reset_expires TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE students (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, student_id VARCHAR(20) UNIQUE NOT NULL, department_id INTEGER REFERENCES departments(id), enrollment_year INTEGER NOT NULL, current_semester INTEGER DEFAULT 1, total_credits_completed DECIMAL(5,2) DEFAULT 0, cumulative_gpa DECIMAL(3,2) DEFAULT 0, academic_standing VARCHAR(50) DEFAULT 'Good Standing', max_credits_per_semester INTEGER DEFAULT 18, min_credits_per_semester INTEGER DEFAULT 12, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE faculty (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, faculty_id VARCHAR(20) UNIQUE NOT NULL, department_id INTEGER REFERENCES departments(id), designation VARCHAR(100), specialization TEXT, office_location VARCHAR(100), office_hours TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE courses (id SERIAL PRIMARY KEY, course_code VARCHAR(20) UNIQUE NOT NULL, course_name VARCHAR(200) NOT NULL, department_id INTEGER REFERENCES departments(id), credits INTEGER NOT NULL DEFAULT 3, description TEXT, course_level VARCHAR(20) DEFAULT 'undergraduate' CHECK (course_level IN ('undergraduate','graduate','postgraduate')), is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE course_offerings (id SERIAL PRIMARY KEY, course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE, faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL, semester VARCHAR(20) NOT NULL, academic_year INTEGER NOT NULL, section VARCHAR(10) NOT NULL DEFAULT 'A', max_capacity INTEGER NOT NULL DEFAULT 60, current_enrollment INTEGER DEFAULT 0, room_number VARCHAR(50), schedule_days VARCHAR(100), start_time TIME, end_time TIME, registration_start_date DATE, registration_end_date DATE, add_drop_deadline DATE, status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','cancelled','completed')), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(course_id, semester, academic_year, section))`);
        await client.query(`CREATE TABLE prerequisites (id SERIAL PRIMARY KEY, course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE, prerequisite_course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE, is_corequisite BOOLEAN DEFAULT false, minimum_grade VARCHAR(2) DEFAULT 'D', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(course_id, prerequisite_course_id))`);
        await client.query(`CREATE TABLE enrollments (id SERIAL PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE, course_offering_id INTEGER NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE, enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled','dropped','completed','withdrawn')), dropped_date TIMESTAMP, grade VARCHAR(2), grade_points DECIMAL(3,2), is_grade_published BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(student_id, course_offering_id))`);
        await client.query(`CREATE TABLE waitlists (id SERIAL PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE, course_offering_id INTEGER NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE, position INTEGER NOT NULL, added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting','enrolled','expired','removed')), notified_date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(student_id, course_offering_id))`);
        await client.query(`CREATE TABLE grades (id SERIAL PRIMARY KEY, enrollment_id INTEGER UNIQUE NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE, letter_grade VARCHAR(2) NOT NULL, grade_points DECIMAL(3,2) NOT NULL, percentage DECIMAL(5,2), submitted_by INTEGER REFERENCES faculty(id), submitted_date TIMESTAMP, approved_by INTEGER REFERENCES users(id), approved_date TIMESTAMP, is_approved BOOLEAN DEFAULT false, is_published BOOLEAN DEFAULT false, published_date TIMESTAMP, comments TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE notifications (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, type VARCHAR(50) NOT NULL, subject VARCHAR(255) NOT NULL, message TEXT NOT NULL, is_read BOOLEAN DEFAULT false, is_email_sent BOOLEAN DEFAULT false, email_sent_date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await client.query(`CREATE TABLE audit_logs (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, action VARCHAR(100) NOT NULL, entity_type VARCHAR(50) NOT NULL, entity_id INTEGER, old_values JSONB, new_values JSONB, ip_address VARCHAR(45), user_agent TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        // Departments
        const deptData = [
            ['CSE','Computer Science & Engineering','Dept of CSE'],
            ['IT','Information Technology','Dept of IT'],
            ['AIML','CS with AI & ML','Dept of AIML'],
            ['AIDS','AI & Data Science','Dept of AIDS'],
            ['MECH','Mechanical Engineering','Dept of Mech'],
            ['CIVIL','Civil Engineering','Dept of Civil'],
            ['EXTC','Electronics & Telecom','Dept of EXTC'],
        ];
        for (const [code, name, desc] of deptData) {
            await client.query('INSERT INTO departments(code,name,description) VALUES($1,$2,$3)', [code, name, desc]);
        }
        const cseId  = (await client.query("SELECT id FROM departments WHERE code='CSE'")).rows[0].id;
        const itId   = (await client.query("SELECT id FROM departments WHERE code='IT'")).rows[0].id;
        const aimlId = (await client.query("SELECT id FROM departments WHERE code='AIML'")).rows[0].id;

        const pwd = await bcrypt.hash('Password@123', 10);

        // Admin
        await client.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES('admin@university.edu',$1,'admin','Admin','User')`, [pwd]);
        const adminUserId = (await client.query("SELECT id FROM users WHERE email='admin@university.edu'")).rows[0].id;

        // Faculty
        const f1 = await client.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES('john.smith@university.edu',$1,'faculty','John','Smith') RETURNING id`, [pwd]);
        const f2 = await client.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES('dr.sharma@campusconnect.edu',$1,'faculty','Dr. Rajesh','Sharma') RETURNING id`, [pwd]);
        await client.query(`INSERT INTO faculty(user_id,faculty_id,department_id,designation,specialization) VALUES($1,'FAC001',$2,'Associate Professor','Algorithms & Data Structures')`, [f1.rows[0].id, cseId]);
        await client.query(`INSERT INTO faculty(user_id,faculty_id,department_id,designation,specialization) VALUES($1,'FAC002',$2,'Assistant Professor','Machine Learning')`, [f2.rows[0].id, aimlId]);
        const fac1Id = (await client.query("SELECT id FROM faculty WHERE faculty_id='FAC001'")).rows[0].id;
        const fac2Id = (await client.query("SELECT id FROM faculty WHERE faculty_id='FAC002'")).rows[0].id;

        // Students
        const s1 = await client.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES('alice.anderson@student.edu',$1,'student','Alice','Anderson') RETURNING id`, [pwd]);
        const s2 = await client.query(`INSERT INTO users(email,password_hash,role,first_name,last_name) VALUES('bob.patel@student.edu',$1,'student','Bob','Patel') RETURNING id`, [pwd]);
        await client.query(`INSERT INTO students(user_id,student_id,department_id,enrollment_year,current_semester) VALUES($1,'STU2023001',$2,2023,5)`, [s1.rows[0].id, cseId]);
        await client.query(`INSERT INTO students(user_id,student_id,department_id,enrollment_year,current_semester) VALUES($1,'STU2023002',$2,2023,3)`, [s2.rows[0].id, itId]);
        const stu1Id = (await client.query("SELECT id FROM students WHERE student_id='STU2023001'")).rows[0].id;

        // Courses
        const courseDefs = [
            ['CS201','Data Structures & Algorithms', cseId,  4,'undergraduate','Arrays, linked lists, trees, graphs, algorithm analysis.'],
            ['CS301','Database Management Systems',  cseId,  4,'undergraduate','SQL, normalization, transactions, indexing.'],
            ['CS401','Machine Learning',             aimlId, 4,'undergraduate','Supervised & unsupervised learning, neural networks.'],
            ['CS202','Object Oriented Programming',  cseId,  3,'undergraduate','OOP concepts in Java: classes, inheritance, design patterns.'],
            ['CS302','Computer Networks',            cseId,  3,'undergraduate','TCP/IP, routing, HTTP, socket programming.'],
            ['IT301','Web Technologies',             itId,   3,'undergraduate','HTML, CSS, JavaScript, React, Node.js, REST APIs.'],
            ['IT401','Cloud Computing',              itId,   3,'undergraduate','AWS, Azure, Docker, Kubernetes, microservices.'],
            ['AI301','Natural Language Processing',  aimlId, 4,'undergraduate','Transformers, BERT, GPT, real-world NLP pipelines.'],
            ['CS501','Deep Learning',                aimlId, 4,'graduate',     'CNNs, RNNs, Transformers, PyTorch.'],
            ['CS601','Software Engineering',         cseId,  3,'undergraduate','SDLC, Agile, design patterns, testing.'],
        ];
        for (const [code, name, deptId, credits, level, desc] of courseDefs) {
            await client.query('INSERT INTO courses(course_code,course_name,department_id,credits,course_level,description) VALUES($1,$2,$3,$4,$5,$6)', [code, name, deptId, credits, level, desc]);
        }

        const getC = async (code) => (await client.query('SELECT id FROM courses WHERE course_code=$1', [code])).rows[0].id;
        const offeringDefs = [
            [await getC('CS201'), fac1Id, 'Spring', 2026, 'A', 60, 'LH-301', 'Mon,Wed,Fri', '09:00', '10:00'],
            [await getC('CS301'), fac1Id, 'Spring', 2026, 'A', 55, 'LH-302', 'Tue,Thu',     '10:30', '12:00'],
            [await getC('CS401'), fac2Id, 'Spring', 2026, 'A', 50, 'LH-401', 'Mon,Wed',     '14:00', '15:30'],
            [await getC('CS202'), fac1Id, 'Spring', 2026, 'B', 60, 'LH-201', 'Tue,Thu',     '08:00', '09:00'],
            [await getC('CS302'), fac2Id, 'Spring', 2026, 'A', 45, 'LH-303', 'Mon,Wed,Fri', '11:00', '12:00'],
            [await getC('IT301'), fac1Id, 'Spring', 2026, 'A', 60, 'LH-202', 'Mon,Wed,Fri', '13:00', '14:00'],
            [await getC('IT401'), fac2Id, 'Spring', 2026, 'A', 40, 'LH-402', 'Tue,Thu',     '09:00', '10:30'],
            [await getC('AI301'), fac2Id, 'Spring', 2026, 'A', 35, 'LH-403', 'Mon,Wed',     '16:00', '17:30'],
            [await getC('CS501'), fac2Id, 'Spring', 2026, 'A', 30, 'LH-501', 'Tue,Thu',     '15:00', '16:30'],
            [await getC('CS601'), fac1Id, 'Spring', 2026, 'A', 55, 'LH-304', 'Fri',         '14:00', '17:00'],
        ];
        const offeringIds = [];
        for (const [cid, fid, sem, yr, sec, cap, room, days, st, et] of offeringDefs) {
            const r = await client.query(
                'INSERT INTO course_offerings(course_id,faculty_id,semester,academic_year,section,max_capacity,room_number,schedule_days,start_time,end_time) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id',
                [cid, fid, sem, yr, sec, cap, room, days, st, et]
            );
            offeringIds.push(r.rows[0].id);
        }

        // Alice: 3 completed + graded courses
        const gradeMap = [{ g:'A',p:4.0,pct:93 },{ g:'B+',p:3.3,pct:86 },{ g:'A-',p:3.7,pct:90 }];
        for (let i = 0; i < 3; i++) {
            const enr = await client.query(
                `INSERT INTO enrollments(student_id,course_offering_id,status,grade,grade_points,is_grade_published) VALUES($1,$2,'completed',$3,$4,true) RETURNING id`,
                [stu1Id, offeringIds[i], gradeMap[i].g, gradeMap[i].p]
            );
            await client.query(
                `INSERT INTO grades(enrollment_id,letter_grade,grade_points,percentage,submitted_by,submitted_date,is_approved,is_published,published_date,approved_by,approved_date) VALUES($1,$2,$3,$4,$5,NOW(),true,true,NOW(),$6,NOW())`,
                [enr.rows[0].id, gradeMap[i].g, gradeMap[i].p, gradeMap[i].pct, fac1Id, adminUserId]
            );
            await client.query('UPDATE course_offerings SET current_enrollment=current_enrollment+1 WHERE id=$1', [offeringIds[i]]);
        }
        // Alice: 2 currently enrolled
        for (let i = 3; i < 5; i++) {
            await client.query('INSERT INTO enrollments(student_id,course_offering_id,status) VALUES($1,$2,\'enrolled\')', [stu1Id, offeringIds[i]]);
            await client.query('UPDATE course_offerings SET current_enrollment=current_enrollment+1 WHERE id=$1', [offeringIds[i]]);
        }
        await client.query(`UPDATE students SET cumulative_gpa=3.67,total_credits_completed=12,academic_standing='Dean''s List' WHERE id=$1`, [stu1Id]);

        logger.info('✅ Auto-seed complete');
        res.json({
            success: true,
            message: '✅ Database seeded successfully! You can now login and enroll in courses.',
            credentials: {
                admin: 'admin@university.edu / Password@123',
                faculty: 'john.smith@university.edu / Password@123',
                student: 'alice.anderson@student.edu / Password@123',
            }
        });
    } catch (err) {
        logger.error('Seed error:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        client.release();
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================

const startServer = async () => {
    try {
        // Test database connection
        await db.query('SELECT NOW()');
        logger.info('Database connection established successfully');

        // Start server
        app.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            logger.info(`Health check available at http://localhost:${PORT}/health`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
