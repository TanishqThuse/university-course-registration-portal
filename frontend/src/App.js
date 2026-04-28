import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import Exams from './pages/Exams';
import Fees from './pages/Fees';
import Events from './pages/Events';
import CareerPortal from './pages/CareerPortal';
import Grievance from './pages/Grievance';

// Components
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';

import './App.css';

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isPublic = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="app-layout">
      {user && !isPublic && <Sidebar />}
      <main className={`main-content ${user && !isPublic ? 'with-sidebar' : ''}`}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student */}
          <Route path="/student/dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/register-courses" element={<PrivateRoute role="student"><CourseRegistration /></PrivateRoute>} />
          <Route path="/student/schedule" element={<PrivateRoute role="student"><MySchedule /></PrivateRoute>} />
          <Route path="/student/grades" element={<PrivateRoute role="student"><MyGrades /></PrivateRoute>} />
          <Route path="/student/attendance" element={<PrivateRoute role="student"><Attendance /></PrivateRoute>} />
          <Route path="/student/timetable" element={<PrivateRoute role="student"><Timetable /></PrivateRoute>} />
          <Route path="/student/assignments" element={<PrivateRoute role="student"><Assignments /></PrivateRoute>} />
          <Route path="/student/exams" element={<PrivateRoute role="student"><Exams /></PrivateRoute>} />
          <Route path="/student/fees" element={<PrivateRoute role="student"><Fees /></PrivateRoute>} />
          <Route path="/student/events" element={<PrivateRoute role="student"><Events /></PrivateRoute>} />
          <Route path="/student/career" element={<PrivateRoute role="student"><CareerPortal /></PrivateRoute>} />
          <Route path="/student/grievance" element={<PrivateRoute role="student"><Grievance /></PrivateRoute>} />

          {/* Faculty */}
          <Route path="/faculty/dashboard" element={<PrivateRoute role="faculty"><FacultyDashboard /></PrivateRoute>} />
          <Route path="/faculty/grade-entry/:offeringId" element={<PrivateRoute role="faculty"><GradeEntry /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/courses" element={<PrivateRoute role="admin"><CourseManagement /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute role="admin"><Reports /></PrivateRoute>} />

          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
