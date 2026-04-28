import React, { useState, useEffect } from 'react';
import api from '../services/api';

function MyGrades() {
  const [gradesData, setGradesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await api.get('/grades/my-grades');
      setGradesData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupBySemester = (grades) => {
    const grouped = {};
    grades.forEach(grade => {
      const key = `${grade.semester} ${grade.academic_year}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(grade);
    });
    return grouped;
  };

  if (loading) {
    return <div className="loading">Loading grades...</div>;
  }

  if (!gradesData) {
    return <div className="empty-state">Failed to load grades</div>;
  }

  const groupedGrades = groupBySemester(gradesData.grades);

  return (
    <div className="container" style={{ maxWidth: '1200px', padding: '20px' }}>
      <div className="page-header">
        <h1>My Grades</h1>
        <p>View your academic performance and transcript</p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <h3>Cumulative GPA</h3>
          <div className="stat-value">{gradesData.cumulativeGPA.toFixed(2)}</div>
          <div className="stat-label">Out of 4.0</div>
        </div>

        <div className="stat-card">
          <h3>Total Credits</h3>
          <div className="stat-value">{gradesData.totalCredits}</div>
          <div className="stat-label">Credits Completed</div>
        </div>
      </div>

      {Object.keys(groupedGrades).length === 0 ? (
        <div className="empty-state">
          <h3>No grades available</h3>
          <p>Grades will appear here once published by faculty</p>
        </div>
      ) : (
        Object.entries(groupedGrades).map(([semester, courses]) => (
          <div key={semester} className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '16px', color: '#111827' }}>{semester}</h2>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Grade Points</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={index}>
                      <td><strong>{course.course_code}</strong></td>
                      <td>{course.course_name}</td>
                      <td>{course.credits}</td>
                      <td>
                        {course.is_grade_published ? (
                          <span className="badge badge-success">{course.grade}</span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </td>
                      <td>
                        {course.is_grade_published && course.grade_points !== null
                          ? course.grade_points.toFixed(2)
                          : '-'}
                      </td>
                      <td>
                        {course.is_grade_published ? (
                          <span className="badge badge-success">Published</span>
                        ) : (
                          <span className="badge badge-info">In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Semester Credits:</strong>{' '}
                {courses.reduce((sum, c) => sum + c.credits, 0)}
              </div>
              <div>
                <strong>Semester GPA:</strong>{' '}
                {(() => {
                  const publishedCourses = courses.filter(c => c.is_grade_published && c.grade_points !== null);
                  if (publishedCourses.length === 0) return 'N/A';
                  const totalCredits = publishedCourses.reduce((sum, c) => sum + c.credits, 0);
                  const qualityPoints = publishedCourses.reduce((sum, c) => sum + (c.credits * c.grade_points), 0);
                  return (qualityPoints / totalCredits).toFixed(2);
                })()}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyGrades;
