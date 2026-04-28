# 🚀 Quick Start Guide

## Get the system running in 5 minutes!

### Step 1: Install Prerequisites

Make sure you have:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **Git** (optional, for cloning)

### Step 2: Database Setup

```bash
# Open terminal and create database
createdb university_system

# If you don't have createdb command, use psql:
psql -U postgres
CREATE DATABASE university_system;
\q
```

### Step 3: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies (this may take a minute)
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your settings:
# - Set DB_PASSWORD to your PostgreSQL password
# - Set JWT_SECRET to any random string (e.g., "my-super-secret-key-12345")
# - For email, you can use Gmail:
#   SMTP_HOST=smtp.gmail.com
#   SMTP_PORT=587
#   SMTP_USER=your-email@gmail.com
#   SMTP_PASSWORD=your-app-password

# Run database migrations
npm run migrate

# Seed test data
npm run seed

# Start backend server
npm run dev
```

✅ Backend should now be running on **http://localhost:5000**

### Step 4: Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start frontend server
npm start
```

✅ Frontend should now be running on **http://localhost:3000**

Your browser should automatically open to http://localhost:3000

### Step 5: Login and Test

Use these test credentials:

**Student Account:**
- Email: `alice.anderson@student.edu`
- Password: `Password@123`

**Faculty Account:**
- Email: `john.smith@university.edu`
- Password: `Password@123`

**Admin Account:**
- Email: `admin@university.edu`
- Password: `Password@123`

---

## 🎯 What to Test

### As a Student:
1. **Login** with student credentials
2. **View Dashboard** - See your GPA and enrolled courses
3. **Register for Courses** - Browse and enroll in available courses
4. **View Schedule** - See your course schedule
5. **Check Grades** - View your grades and GPA

### As Faculty:
1. **Login** with faculty credentials
2. **View Dashboard** - See your assigned courses
3. **Enter Grades** - Click "Enter Grades" for a course
4. **Submit Grades** - Enter letter grades for students

### As Admin:
1. **Login** with admin credentials
2. **View Dashboard** - See system overview
3. **Manage Courses** - View course catalog
4. **View Reports** - See enrollment and grade statistics

---

## 🧪 Test Scenarios

### Test Prerequisite Validation:
1. Login as student
2. Try to enroll in "CS201 - Data Structures" (requires CS101)
3. System should show prerequisite error if not completed

### Test Schedule Conflict Detection:
1. Login as student
2. Enroll in a course (e.g., CS101 Section A - MWF 9:00-9:50)
3. Try to enroll in another course at the same time
4. System should show schedule conflict error

### Test Waitlist:
1. Login as student
2. Find a full course
3. Click "Join Waitlist"
4. You should be added to waitlist with a position number

### Test GPA Calculation:
1. Login as faculty
2. Enter grades for students
3. Login as admin (in another browser/incognito)
4. Approve the grades
5. Login as student
6. Check "My Grades" - GPA should be calculated

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check if PostgreSQL is running
pg_isready

# Check if database exists
psql -U postgres -l | grep university_system

# Check logs
cat backend/logs/error.log
```

### Frontend won't start:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if backend is running
curl http://localhost:5000/health
```

### Database connection error:
1. Check PostgreSQL is running
2. Verify DB_PASSWORD in backend/.env
3. Verify DB_USER in backend/.env (default: postgres)
4. Try connecting manually: `psql -U postgres -d university_system`

### Email not working:
- Email is optional for testing
- To use Gmail:
  1. Enable 2-factor authentication
  2. Generate app password
  3. Use app password in SMTP_PASSWORD

### Port already in use:
```bash
# Backend (port 5000)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Next Steps

After testing the system:

1. **Read the Documentation:**
   - `README.md` - Overview and features
   - `PROJECT_SUMMARY.md` - Complete implementation details
   - `IMPLEMENTATION_GUIDE.md` - Detailed setup and architecture

2. **Customize for Your Institution:**
   - Update branding and colors
   - Modify email templates
   - Adjust GPA calculation rules
   - Add your departments and courses

3. **Deploy to Production:**
   - Follow deployment guide in `IMPLEMENTATION_GUIDE.md`
   - Set up HTTPS
   - Configure production database
   - Set up monitoring

---

## 💡 Tips

- **Use different browsers** or incognito mode to test different user roles simultaneously
- **Check the logs** in `backend/logs/` if something goes wrong
- **Database is reset** when you run `npm run seed` again
- **JWT tokens expire** after 24 hours (configurable in .env)
- **Email notifications** require SMTP configuration

---

## 🎓 Sample Data Included

After seeding, you'll have:
- **8 Departments** (CS, Math, Physics, etc.)
- **15+ Courses** with prerequisites
- **14 Course Offerings** for Spring 2026
- **5 Students** with various enrollments
- **5 Faculty Members** assigned to courses
- **2 Administrators**
- **Sample grades** for completed courses

---

## ✅ Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created: `university_system`
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] Migrations run successfully
- [ ] Seed data loaded
- [ ] Backend running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend .env configured
- [ ] Frontend running on port 3000
- [ ] Can login as student
- [ ] Can browse and enroll in courses
- [ ] Can view schedule and grades
- [ ] Can login as faculty
- [ ] Can enter grades
- [ ] Can login as admin
- [ ] Can view reports

---

## 🎉 You're All Set!

The system is now fully functional. Explore all the features and test the core functionality:

✅ User Authentication
✅ Course Registration with Validation
✅ Prerequisite Checking
✅ Schedule Conflict Detection
✅ Waitlist Management
✅ Grade Entry and GPA Calculation
✅ Reporting and Analytics

**Enjoy your University Course Registration System!**

---

*For detailed information, see PROJECT_SUMMARY.md and IMPLEMENTATION_GUIDE.md*
