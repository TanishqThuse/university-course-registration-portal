import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, scheduleRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/registration/my-schedule')
      ]);

      setProfile(profileRes.data.data);
      setSchedule(scheduleRes.data.data.filter(course => course.status === 'enrolled'));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.first_name}!</h1>
        <p>Student Dashboard</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Cumulative GPA</h3>
          <div className="stat-value">
            {profile?.cumulative_gpa ? profile.cumulative_gpa.toFixed(2) : '0.00'}
          </div>
          <div className="stat-label">Out of 4.0</div>
        </div>

        <div className="stat-card">
          <h3>Total Credits</h3>
          <div className="stat-value">
            {profile?.total_credits_completed || 0}
          </div>
          <div className="stat-label">Credits Completed</div>
        </div>

        <div className="stat-card">
          <h3>Current Semester</h3>
          <div className="stat-value">
            {profile?.current_semester || 1}
          </div>
          <div className="stat-label">Semester</div>
        </div>

        <div className="stat-card">
          <h3>Academic Standing</h3>
          <div className="stat-value" style={{ fontSize: '20px' }}>
            {profile?.academic_standing || 'Good Standing'}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Current Enrollments</h2>
        {schedule.length === 0 ? (
          <div className="empty-state">
            <h3>No courses enrolled</h3>
            <p>Start by registering for courses</p>
            <Link to="/student/register-courses" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Register for Courses
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Schedule</th>
                  <th>Faculty</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map(course => (
                  <tr key={course.enrollment_id}>
                    <td><strong>{course.course_code}</strong></td>
                    <td>{course.course_name}</td>
                    <td>{course.credits}</td>
                    <td>
                      {course.schedule_days && course.start_time ? (
                        `${course.schedule_days} ${course.start_time}-${course.end_time}`
                      ) : (
                        'TBA'
                      )}
                    </td>
                    <td>{course.faculty_name || 'TBA'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <Link to="/student/register-courses" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <h3 style={{ color: '#2563eb', marginBottom: '8px' }}>📚 Register for Courses</h3>
          <p style={{ color: '#6b7280' }}>Browse and enroll in available courses</p>
        </Link>

        <Link to="/student/schedule" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <h3 style={{ color: '#2563eb', marginBottom: '8px' }}>📅 My Schedule</h3>
          <p style={{ color: '#6b7280' }}>View your complete course schedule</p>
        </Link>

        <Link to="/student/grades" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <h3 style={{ color: '#2563eb', marginBottom: '8px' }}>📊 My Grades</h3>
          <p style={{ color: '#6b7280' }}>Check your grades and transcript</p>
        </Link>
      </div>
    </div>
  );
}

export default StudentDashboard;
