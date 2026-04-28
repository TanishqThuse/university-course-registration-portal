import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          University System
        </Link>

        {user && (
          <div className="navbar-menu">
            {user.role === 'student' && (
              <>
                <Link to="/student/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/student/register-courses" className="nav-link">Register Courses</Link>
                <Link to="/student/schedule" className="nav-link">My Schedule</Link>
                <Link to="/student/grades" className="nav-link">My Grades</Link>
              </>
            )}

            {user.role === 'faculty' && (
              <>
                <Link to="/faculty/dashboard" className="nav-link">Dashboard</Link>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/admin/courses" className="nav-link">Courses</Link>
                <Link to="/admin/reports" className="nav-link">Reports</Link>
              </>
            )}

            <div className="navbar-user">
              <span className="user-name">{user.first_name} {user.last_name}</span>
              <span className="user-role">({user.role})</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
