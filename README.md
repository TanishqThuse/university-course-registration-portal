# CampusConnect - Developer Guide

Welcome to the **CampusConnect** repository! This is a full-stack PERN (PostgreSQL, Express, React, Node.js) application acting as a comprehensive university course registration and student management system.

This README is designed for developers who want to set up, understand, and contribute to the project.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js 18
- **Routing:** React Router DOM v6
- **Styling:** Custom CSS (Flexbox, CSS Grid, CSS Variables) + CSS Modules
- **HTTP Client:** Axios
- **State Management:** React Context API (AuthContext)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (using `pg` library)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing
- **Security:** Helmet, Express Rate Limit, CORS

---

## 🚀 Quick Start Guide

Follow these instructions to get the project running on your local machine.

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (v14 or higher) installed and running on your machine.

### 2. Database Setup
Create an empty PostgreSQL database. You can name it `university_system`.
```sql
CREATE DATABASE university_system;
```

### 3. Environment Variables
You need to set up environment variables in both the `backend` and `frontend` folders.

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=university_system
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Authentication
JWT_SECRET=super_secret_jwt_key_for_development
JWT_EXPIRES_IN=24h
```

**Frontend (`frontend/.env`):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Install Dependencies
Open two separate terminals for frontend and backend.

```bash
# Terminal 1 - Backend
cd backend
npm install

# Terminal 2 - Frontend
cd frontend
npm install
```

### 5. Initialize the Database (CRITICAL STEP)
We have a custom setup script that drops old tables, creates new ones, and seeds the database with demo data (departments, courses, offerings, and users). **You must run this before starting the app.**

```bash
# In the backend directory
npm run setup
```
*If successful, you will see `✅ Setup complete!` and a list of generated test credentials.*

### 6. Start the Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Starts on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm start
# Starts on http://localhost:3001 (or 3000 depending on availability)
```

---

## 🧪 Test Credentials

Once you've run `npm run setup`, the following accounts are available for testing:
- **Password for all users:** `Password@123`

| Role | Email | Use Case |
|---|---|---|
| **Student** | `alice.anderson@student.edu` | View dashboard, join courses, view schedule, attendance, grades |
| **Faculty** | `dr.sharma@campusconnect.edu` | View assigned courses, grade entry |
| **Admin** | `admin@campusconnect.edu` | Manage courses, system overview |

---

## 📁 Project Structure

```text
SE_CP/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection (database.js) and setup.js
│   │   ├── controllers/    # Route controllers (auth, course, registration, etc.)
│   │   ├── middleware/     # Auth middleware, Error handlers
│   │   ├── routes/         # Express API routes definition
│   │   └── utils/          # Logger, helpers
│   ├── server.js           # Express App Entry Point
│   └── package.json        
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, Sidebar, PrivateRoute)
│   │   ├── context/        # AuthContext (Handles global user state)
│   │   ├── pages/          # Full page views (StudentDashboard, Register, Exams, etc.)
│   │   ├── services/       # API integration (axios config)
│   │   ├── App.js          # Routing configuration
│   │   └── index.css       # Global styles and utility classes
│   └── package.json
├── PROJECT_EVALUATION.md   # Feature overview and demo guide
└── README.md               # This file
```

---

## 🐞 Common Troubleshooting

1. **Login fails with "Network Error" or "CORS Error"**
   - Ensure the backend is running (`npm run dev` in the backend folder).
   - Ensure the `backend/server.js` CORS configuration allows requests from your frontend port (usually 3000 or 3001).

2. **Database connection failed / Relation does not exist**
   - Ensure PostgreSQL service is running.
   - Verify `DB_PASSWORD` and `DB_USER` in `backend/.env`.
   - **Crucial:** Run `npm run setup` in the backend folder to recreate the tables and seed data. Do not use `npm run migrate` or `npm run seed` individually as the `setup.js` script handles it cleanly in one pass.

3. **Port already in use**
   - If port 5000 is taken, change the `PORT` in `backend/.env` and update `REACT_APP_API_URL` in `frontend/.env`.

---

## 🤝 Contributing
1. Create a feature branch (`git checkout -b feature/your-feature-name`)
2. Make your changes and commit (`git commit -m 'Added amazing feature'`)
3. Push to the branch (`git push origin feature/your-feature-name`)
4. Open a Pull Request for review.
