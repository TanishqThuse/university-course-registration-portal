# University Course Registration and Result Management System

A comprehensive web-based solution for streamlining student course registration, managing academic records, and facilitating result processing and dissemination.

## 🎯 Features

### Core Modules
- **User Authentication & Authorization**: Role-based access control (Student, Faculty, Admin)
- **Course Management**: Complete course catalog, scheduling, and capacity management
- **Course Registration**: Real-time registration with prerequisite validation and conflict detection
- **Result Management**: Grade entry, GPA calculation, and transcript generation
- **Reporting & Analytics**: Comprehensive dashboards and customizable reports
- **Notification System**: Automated email notifications for key events

### Key Capabilities
- ✅ Prerequisite validation
- ✅ Schedule conflict detection
- ✅ Waitlist management with auto-enrollment
- ✅ Automated GPA calculation (semester & cumulative)
- ✅ Transcript generation
- ✅ Academic standing calculation
- ✅ Audit logging
- ✅ Real-time availability updates

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + React Router + Axios + TailwindCSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT-based authentication
- **Email**: Nodemailer with SMTP
- **Testing**: Jest + Supertest

### Architecture Pattern
Clean layered architecture:
```
├── Presentation Layer (React Frontend)
├── API Layer (Express REST API)
├── Business Logic Layer (Services)
├── Data Access Layer (Repositories)
└── Database Layer (PostgreSQL)
```

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- SMTP server access (for email notifications)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb university_system

# Run migrations
cd backend
npm run migrate
```

### 3. Environment Configuration

Create `.env` file in backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=university_system
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@university.edu

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Create `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 👥 Default Users

After running migrations, the following test users are available:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@university.edu | Admin@123 | System Administrator |
| Faculty | faculty@university.edu | Faculty@123 | Faculty Member |
| Student | student@university.edu | Student@123 | Student User |

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user profile

### Course Management (Admin/Faculty)
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Course Registration (Student)
- `GET /api/registration/available-courses` - Browse available courses
- `POST /api/registration/enroll` - Enroll in course
- `DELETE /api/registration/drop/:enrollmentId` - Drop course
- `GET /api/registration/my-schedule` - View current schedule
- `POST /api/registration/waitlist` - Join waitlist

### Result Management (Faculty/Admin)
- `POST /api/grades` - Submit grades
- `GET /api/grades/course/:courseId` - Get course grades
- `PUT /api/grades/:id` - Update grade
- `GET /api/transcripts/:studentId` - Generate transcript
- `GET /api/gpa/:studentId` - Calculate GPA

### Reporting (Admin)
- `GET /api/reports/enrollment` - Enrollment statistics
- `GET /api/reports/grade-distribution` - Grade distribution
- `GET /api/reports/academic-standing` - Academic standing report

## 🗄️ Database Schema

### Core Tables
- **users** - User authentication and profiles
- **students** - Student-specific information
- **faculty** - Faculty-specific information
- **courses** - Course catalog
- **course_offerings** - Semester-specific course instances
- **enrollments** - Student course registrations
- **waitlists** - Course waitlist management
- **grades** - Student grades and results
- **prerequisites** - Course prerequisite relationships
- **audit_logs** - System activity tracking

See `database/schema.sql` for complete schema definition.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Run specific test suite
npm test -- auth.test.js

# Coverage report
npm run test:coverage

# Frontend tests
cd frontend
npm test
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting on authentication endpoints
- ✅ Secure session management (30-minute timeout)
- ✅ HTTPS enforcement (production)
- ✅ Audit logging

## 📊 Performance Optimization

- Database indexing on frequently queried columns
- Connection pooling for database
- Caching strategies for course catalog
- Optimized queries with proper joins
- Pagination for large datasets
- Lazy loading in frontend
- Code splitting in React

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# The build folder is ready to be deployed
```

### Environment Variables (Production)

Ensure all environment variables are properly set:
- Use strong JWT secret
- Configure production database
- Set up production SMTP server
- Enable HTTPS
- Set NODE_ENV=production

### Recommended Deployment Platforms
- **Backend**: AWS EC2, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, Heroku Postgres, DigitalOcean Managed Database

## 📖 Project Structure

```
university-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── validators/     # Input validation
│   ├── tests/              # Test files
│   └── server.js           # Entry point
├── frontend/
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       ├── context/        # React context
│       ├── hooks/          # Custom hooks
│       └── utils/          # Helper functions
├── database/
│   ├── schema.sql          # Database schema
│   ├── migrations/         # Migration scripts
│   └── seeds/              # Seed data
└── docs/
    ├── API.md              # API documentation
    ├── ARCHITECTURE.md     # Architecture details
    └── DEPLOYMENT.md       # Deployment guide
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact: support@university.edu

## 🔄 Version History

- **v1.0.0** (2026-04-21) - Initial release
  - User authentication and RBAC
  - Course management
  - Course registration with validation
  - Result management and GPA calculation
  - Reporting and analytics
  - Email notifications

## 🎓 Compliance

This system complies with:
- FERPA (Family Educational Rights and Privacy Act)
- WCAG 2.1 (Web Content Accessibility Guidelines)
- University data privacy policies

## ⚠️ Important Notes

- Change all default passwords before production deployment
- Configure proper backup strategies for the database
- Set up monitoring and logging for production
- Conduct security audit before going live
- Perform load testing to validate performance requirements
- Ensure 99.5% uptime SLA during critical periods
