import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const studentNav = [
  { path: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/student/register-courses', icon: '📚', label: 'Join Courses' },
  { path: '/student/schedule', icon: '📅', label: 'My Schedule' },
  { path: '/student/grades', icon: '📊', label: 'Grades & Results' },
  { path: '/student/attendance', icon: '✅', label: 'Attendance' },
  { path: '/student/timetable', icon: '🕐', label: 'Timetable' },
  { path: '/student/assignments', icon: '📝', label: 'Assignments' },
  { path: '/student/exams', icon: '📋', label: 'Examinations' },
  { path: '/student/fees', icon: '💳', label: 'Fees & Payments' },
  { path: '/student/events', icon: '🎉', label: 'Events & Certs' },
  { path: '/student/career', icon: '🚀', label: 'Career & TPO' },
  { path: '/student/grievance', icon: '📣', label: 'Feedback & Grievance' },
];

const facultyNav = [
  { path: '/faculty/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/faculty/grade-entry/1', icon: '📝', label: 'Grade Entry' },
];

const adminNav = [
  { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/admin/courses', icon: '📚', label: 'Course Management' },
  { path: '/admin/reports', icon: '📊', label: 'Reports' },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const isPublicPage = ['/login', '/register'].includes(location.pathname);
  if (isPublicPage) return null;

  const navItems = user.role === 'student' ? studentNav : user.role === 'faculty' ? facultyNav : adminNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {!collapsed && <span className="logo-text">🎓 CampusConnect</span>}
          {collapsed && <span className="logo-icon">🎓</span>}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user.first_name?.[0]}{user.last_name?.[0]}</div>
        {!collapsed && (
          <div className="user-info">
            <div className="user-name">{user.first_name} {user.last_name}</div>
            <div className="user-badge">{user.role}</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
