# CampusConnect - Project Evaluation Document

## 1. Project Overview
**CampusConnect** is a comprehensive, full-stack University Course Registration and Student Management System. It is designed to modernize and streamline the academic and administrative workflows of higher education institutions. 

This project was built to demonstrate proficiency in modern web development using the **PERN stack** (PostgreSQL, Express.js, React.js, Node.js), encompassing complex database design, RESTful API architecture, role-based access control (RBAC), and responsive UI/UX design.

## 2. Objective & Purpose
The primary objective of this project is to provide a centralized portal where:
- **Students** can manage their entire academic lifecycle: from registering for courses and tracking attendance, to viewing timetables, assignments, exam schedules, and paying fees.
- **Faculty** can manage their course offerings, track student enrollment, and submit grades.
- **Administrators** have bird's-eye visibility over the institution's operations, managing course catalogs, generating reports, and monitoring system health.

For evaluation purposes, the system highlights the ability to handle:
- **Complex Relational Data:** Managing the many-to-many relationships between students, courses, faculty, and enrollments.
- **Business Logic Implementation:** Enforcing credit limits, preventing schedule conflicts, and managing waitlists automatically.
- **Security:** Implementing secure authentication (JWT), password hashing (bcrypt), and role-based route protection.

## 3. Key Features Demonstrated

### Student Portal (The Core Focus)
- **Course Marketplace:** A dynamic dashboard to browse available courses, view live seat capacity, and enroll in real-time.
- **Academic Dashboard:** Real-time calculation of Cumulative GPA and credits completed.
- **Attendance Tracker:** Subject-wise visual progress bars and a "can-miss" calculator to maintain the mandatory 75% criteria.
- **Timetable Management:** A visual, color-coded weekly schedule based on enrolled courses.
- **Assignments & Exams:** Tracking pending/submitted assignments, internal assessment marks, and end-semester countdowns.
- **Career & TPO:** Placement opportunity listings with eligibility checks and career goal tracking.
- **Grievance Redressal:** An anonymous feedback and ticketing system for students.
- **Fee Management:** A breakdown of academic and hostel fees with payment tracking.

### Backend Architecture
- **Robust Database Seeding:** A custom `setup.js` script that drops, rebuilds, and populates the database with realistic demo data (departments, users, courses, and active enrollments) in a single command.
- **RESTful API:** Clean, well-documented API endpoints grouped by domain (auth, courses, registration, grades).
- **Error Handling:** Centralized error handling and detailed logging using Morgan.

## 4. Technical Stack
- **Frontend:** React 18, React Router v6, CSS3 (Custom responsive styling with CSS grid/flexbox).
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (using `pg` pool).
- **Security:** JSON Web Tokens (JWT), bcrypt, Helmet, Express Rate Limit, CORS.

## 5. Evaluation & Demo Guide
To evaluate this project, follow this recommended demo flow:

1. **Initial Setup Verification:** 
   Show that running `npm run setup` in the backend dynamically creates the database schema and seeds it with real-world data (10 courses, 10 offerings, test users).
2. **Student Login (Main Demo):**
   - Log in as `alice.anderson@student.edu` (Password: `Password@123`).
   - Show the **Student Dashboard** with live GPA and quick links.
   - Navigate to **Join Courses** to demonstrate the dynamic course marketplace with live seat tracking.
   - Show the **Sidebar Navigation** integrating various modules (Attendance, Timetable, Assignments, Exams).
3. **Responsive UI:**
   - Demonstrate the collapsible sidebar and responsive grid layouts by resizing the browser.

## 6. Future Scope
While the current version provides a robust foundation, future iterations could include:
- Integration with an actual payment gateway (e.g., Stripe/Razorpay) for fee processing.
- Real-time chat integration for student-faculty communication.
- Machine Learning algorithms for course recommendations based on career goals.
