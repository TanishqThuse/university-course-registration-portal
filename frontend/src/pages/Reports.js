import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Reports() {
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [academicStanding, setAcademicStanding] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [enrollment, grades, standing] = await Promise.all([
        api.get('/reports/enrollment?semester=Spring&academicYear=2026'),
        api.get('/reports/grade-distribution'),
        api.get('/reports/academic-standing')
      ]);

      setEnrollmentData(enrollment.data.data);
      setGradeDistribution(grades.data.data);
      setAcademicStanding(standing.data.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '1400px', padding: '20px' }}>
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>System-wide statistics and reports</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Academic Standing Distribution</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Academic Standing</th>
                <th>Number of Students</th>
              </tr>
            </thead>
            <tbody>
              {academicStanding.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.academic_standing}</strong></td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Grade Distribution</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {gradeDistribution.map((item, index) => (
                <tr key={index}>
                  <td><span className="badge badge-info">{item.grade}</span></td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>Enrollment Statistics (Spring 2026)</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Course</th>
                <th>Section</th>
                <th>Capacity</th>
                <th>Enrolled</th>
                <th>Available</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {enrollmentData.map((item, index) => (
                <tr key={index}>
                  <td>{item.department}</td>
                  <td><strong>{item.course_code}</strong> - {item.course_name}</td>
                  <td>{item.section}</td>
                  <td>{item.max_capacity}</td>
                  <td>{item.current_enrollment}</td>
                  <td>{item.available_seats}</td>
                  <td>
                    <span className={`badge ${item.utilization_percent > 80 ? 'badge-success' : 'badge-warning'}`}>
                      {item.utilization_percent}%
                    </span>
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

export default Reports;
