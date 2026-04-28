import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseRegistration from './pages/CourseRegistration';
import MySchedule from './pages/MySchedule';
import MyGrades from './pages/MyGrades';
import GradeEntry from './pages/GradeEntry';
import CourseManagement from './pages/CourseManagement';
import Reports from './pages/Reports';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <PrivateRoute role="student">
                    <StudentDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/register-courses"
                element={
                  <PrivateRoute role="student">
                    <CourseRegistration />
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/schedule"
                element={
                  <PrivateRoute role="student">
                    <MySchedule />
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/grades"
                element={
                  <PrivateRoute role="student">
                    <MyGrades />
                  </PrivateRoute>
                }
              />

              {/* Faculty Routes */}
              <Route
                path="/faculty/dashboard"
                element={
                  <PrivateRoute role="faculty">
                    <FacultyDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/faculty/grade-entry/:offeringId"
                element={
                  <PrivateRoute role="faculty">
                    <GradeEntry />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute role="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <PrivateRoute role="admin">
                    <CourseManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <PrivateRoute role="admin">
                    <Reports />
                  </PrivateRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Home component that redirects based on auth status
function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role
  switch (user.role) {
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'faculty':
      return <Navigate to="/faculty/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default App;
