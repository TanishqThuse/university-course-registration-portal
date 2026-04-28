import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function GradeEntry() {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudents();
  }, [offeringId]);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/grades/course/${offeringId}`);
      const studentsData = response.data.data;
      setStudents(studentsData);

      // Initialize grades state
      const initialGrades = {};
      studentsData.forEach(student => {
        initialGrades[student.enrollment_id] = {
          letterGrade: student.grade || '',
          percentage: student.percentage || '',
          comments: student.comments || ''
        };
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setMessage({ type: 'error', text: 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (enrollmentId, field, value) => {
    setGrades({
      ...grades,
      [enrollmentId]: {
        ...grades[enrollmentId],
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare grades array
    const gradesArray = Object.entries(grades)
      .filter(([_, grade]) => grade.letterGrade)
      .map(([enrollmentId, grade]) => ({
        enrollmentId: parseInt(enrollmentId),
        letterGrade: grade.letterGrade,
        percentage: grade.percentage ? parseFloat(grade.percentage) : null,
        comments: grade.comments
      }));

    if (gradesArray.length === 0) {
      setMessage({ type: 'warning', text: 'No grades to submit' });
      return;
    }

    try {
      await api.post('/grades', { grades: gradesArray });
      setMessage({
        type: 'success',
        text: `Successfully submitted ${gradesArray.length} grades`
      });
      fetchStudents();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit grades'
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '1400px', padding: '20px' }}>
      <div className="page-header">
        <h1>Grade Entry</h1>
        <p>Enter grades for enrolled students</p>
        <button onClick={() => navigate('/faculty/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
          >
            ×
          </button>
        </div>
      )}

      {students.length === 0 ? (
        <div className="empty-state">
          <h3>No students enrolled</h3>
          <p>There are no students enrolled in this course</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Letter Grade</th>
                    <th>Percentage</th>
                    <th>Comments</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.enrollment_id}>
                      <td><strong>{student.student_id}</strong></td>
                      <td>{student.first_name} {student.last_name}</td>
                      <td>{student.email}</td>
                      <td>
                        <select
                          className="form-input"
                          value={grades[student.enrollment_id]?.letterGrade || ''}
                          onChange={(e) => handleGradeChange(student.enrollment_id, 'letterGrade', e.target.value)}
                          style={{ width: '100px' }}
                        >
                          <option value="">Select</option>
                          <option value="A">A</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="B-">B-</option>
                          <option value="C+">C+</option>
                          <option value="C">C</option>
                          <option value="C-">C-</option>
                          <option value="D+">D+</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                          <option value="P">P</option>
                          <option value="NP">NP</option>
                          <option value="W">W</option>
                          <option value="I">I</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          value={grades[student.enrollment_id]?.percentage || ''}
                          onChange={(e) => handleGradeChange(student.enrollment_id, 'percentage', e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                          style={{ width: '80px' }}
                          placeholder="%"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          value={grades[student.enrollment_id]?.comments || ''}
                          onChange={(e) => handleGradeChange(student.enrollment_id, 'comments', e.target.value)}
                          placeholder="Optional"
                          style={{ width: '200px' }}
                        />
                      </td>
                      <td>
                        {student.is_published ? (
                          <span className="badge badge-success">Published</span>
                        ) : student.grade ? (
                          <span className="badge badge-warning">Submitted</span>
                        ) : (
                          <span className="badge badge-info">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary">
                Submit Grades
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default GradeEntry;
