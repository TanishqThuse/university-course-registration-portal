import React, { useState, useEffect } from 'react';
import api from '../services/api';

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setMessage({ type: 'error', text: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '1400px', padding: '20px' }}>
      <div className="page-header">
        <h1>Course Management</h1>
        <p>Manage course catalog and offerings</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td><strong>{course.course_code}</strong></td>
                  <td>{course.course_name}</td>
                  <td>{course.department_name}</td>
                  <td>{course.credits}</td>
                  <td>
                    <span className="badge badge-info">
                      {course.course_level}
                    </span>
                  </td>
                  <td>
                    {course.is_active ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CourseManagement;
