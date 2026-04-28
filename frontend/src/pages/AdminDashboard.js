import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.first_name}!</h1>
        <p>Administrator Dashboard</p>
      </div>

      <div className="dashboard-grid">
        <Link to="/admin/courses" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <h3 style={{ color: '#2563eb', marginBottom: '8px' }}>📚 Course Management</h3>
          <p style={{ color: '#6b7280' }}>Manage courses, offerings, and prerequisites</p>
        </Link>

        <Link to="/admin/reports" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <h3 style={{ color: '#2563eb', marginBottom: '8px' }}>📊 Reports & Analytics</h3>
          <p style={{ color: '#6b7280' }}>View enrollment and performance reports</p>
        </Link>

        <div className="card">
          <h3 style={{ color: '#2563eb', marginBottom: '8px' }}>👥 User Management</h3>
          <p style={{ color: '#6b7280' }}>Manage students, faculty, and administrators</p>
        </div>

        <div className="card">
          <h3 style={{ color: '#2563eb', marginBottom: '8px' }}>✅ Grade Approval</h3>
          <p style={{ color: '#6b7280' }}>Review and approve submitted grades</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>System Overview</h2>
        <p style={{ color: '#6b7280' }}>
          Use the navigation above to access different administrative functions.
          You can manage courses, view reports, handle user accounts, and approve grades.
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;
