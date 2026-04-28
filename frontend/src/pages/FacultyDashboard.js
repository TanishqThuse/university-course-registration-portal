import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function FacultyDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      // Fetch courses taught by this faculty
      const response = await api.get('/courses/offerings', {
        params: {
          semester: 'Spring',
          academicYear: 2026
        }
      });
      setCourses(response.data.data.offerings);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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
        <h1>Welcome, Professor {user.last_name}!</h1>
        <p>Faculty Dashboard</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Courses Teaching</h3>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">This Semester</div>
        </div>

        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="stat-value">
            {courses.reduce((sum, c) => sum + c.current_enrollment, 0)}
          </div>
          <div className="stat-label">Enrolled</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>My Courses</h2>
        {courses.length === 0 ? (
          <div className="empty-state">
            <h3>No courses assigned</h3>
            <p>You don't have any courses assigned for this semester</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Section</th>
                  <th>Enrollment</th>
                  <th>Schedule</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td><strong>{course.course_code}</strong></td>
                    <td>{course.course_name}</td>
                    <td>{course.section}</td>
                    <td>{course.current_enrollment}/{course.max_capacity}</td>
                    <td>
                      {course.schedule_days && course.start_time
                        ? `${course.schedule_days} ${course.start_time}-${course.end_time}`
                        : 'TBA'}
                    </td>
                    <td>
                      <Link
                        to={`/faculty/grade-entry/${course.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Enter Grades
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyDashboard;
