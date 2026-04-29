import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'P', 'NP', 'W', 'I'];
const gradeColors = { A: '#16a34a', 'A-': '#16a34a', 'B+': '#2563eb', B: '#2563eb', 'B-': '#2563eb', 'C+': '#d97706', C: '#d97706', 'C-': '#d97706', 'D+': '#dc2626', D: '#dc2626', F: '#7f1d1d', P: '#6366f1', NP: '#6b7280', W: '#6b7280', I: '#6b7280' };

function GradeEntry() {
  const { offeringId } = useParams();
  const navigate = useNavigate();

  // List of faculty's own offerings
  const [myOfferings, setMyOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState(offeringId || '');

  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast({ type: '', text: '' }), 4000); };

  // Load faculty's own course offerings
  useEffect(() => {
    const fetchOfferings = async () => {
      setOfferingsLoading(true);
      try {
        const res = await api.get('/courses/offerings', { params: { semester: 'Spring', academicYear: 2026 } });
        const all = res.data.data.offerings || [];
        setMyOfferings(all);
        // Auto-select first offering if no offeringId in URL
        if (!selectedOffering && all.length > 0) {
          setSelectedOffering(String(all[0].id));
        }
      } catch (err) {
        console.error('Failed to fetch offerings:', err);
      } finally {
        setOfferingsLoading(false);
      }
    };
    fetchOfferings();
  }, []); // eslint-disable-line

  // Load students whenever selectedOffering changes
  useEffect(() => {
    if (selectedOffering) fetchStudents(selectedOffering);
  }, [selectedOffering]); // eslint-disable-line

  const fetchStudents = async (oId) => {
    setLoading(true);
    setStudents([]);
    try {
      const res = await api.get(`/grades/course/${oId}`);
      const data = res.data.data || [];
      setStudents(data);
      const init = {};
      data.forEach(s => {
        init[s.enrollment_id] = { letterGrade: s.grade || '', percentage: s.percentage || '', comments: s.comments || '' };
      });
      setGrades(init);
    } catch (err) {
      console.error('Grade fetch error:', err);
      showToast('error', `Failed to load students: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (id, field, val) => {
    setGrades(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gradesArray = Object.entries(grades)
      .filter(([, g]) => g.letterGrade)
      .map(([enrollmentId, g]) => ({
        enrollmentId: parseInt(enrollmentId),
        letterGrade: g.letterGrade,
        percentage: g.percentage ? parseFloat(g.percentage) : null,
        comments: g.comments || ''
      }));

    if (gradesArray.length === 0) { showToast('warning', 'No grades to submit. Please select at least one grade.'); return; }

    setSubmitting(true);
    try {
      await api.post('/grades', { grades: gradesArray });
      showToast('success', `✅ Successfully submitted ${gradesArray.length} grade(s)!`);
      fetchStudents(selectedOffering);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to submit grades');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedInfo = myOfferings.find(o => String(o.id) === String(selectedOffering));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Toast */}
      {toast.text && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : '#d97706',
          color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: 400
        }}>{toast.text}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Link to="/faculty/dashboard" style={{ color: '#10b981', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Back to Dashboard</Link>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📝 Grade Entry</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Enter and submit grades for enrolled students</p>
      </div>

      {/* Course Selector */}
      <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>Select Course / Offering</label>
        {offeringsLoading ? (
          <div style={{ color: '#6b7280' }}>Loading your courses...</div>
        ) : myOfferings.length === 0 ? (
          <div style={{ color: '#dc2626' }}>No active course offerings found for Spring 2026.</div>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {myOfferings.map(o => (
              <button key={o.id} onClick={() => setSelectedOffering(String(o.id))} style={{
                padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: String(selectedOffering) === String(o.id) ? '#10b981' : '#f3f4f6',
                color: String(selectedOffering) === String(o.id) ? 'white' : '#374151',
                fontWeight: 700, fontSize: 13, transition: 'all 0.2s'
              }}>
                {o.course_code} — {o.course_name} (Sec {o.section})
              </button>
            ))}
          </div>
        )}
        {selectedInfo && (
          <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 13, color: '#6b7280' }}>
            <span>📅 {selectedInfo.schedule_days || '—'}</span>
            <span>⏰ {selectedInfo.start_time || '—'} – {selectedInfo.end_time || '—'}</span>
            <span>📍 {selectedInfo.room_number || '—'}</span>
            <span>👥 {selectedInfo.current_enrollment}/{selectedInfo.max_capacity} enrolled</span>
          </div>
        )}
      </div>

      {/* Student Grade Table */}
      {loading ? (
        <div style={{ background: 'white', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <div style={{ color: '#6b7280' }}>Loading students...</div>
        </div>
      ) : students.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <h3 style={{ color: '#374151', marginBottom: 8 }}>No students enrolled yet</h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Students will appear here after they enroll in this course offering.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>👥 Student List ({students.length})</h2>
              <button type="submit" disabled={submitting} style={{
                background: submitting ? '#a7f3d0' : '#10b981', color: 'white', border: 'none',
                padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14
              }}>
                {submitting ? '⏳ Submitting...' : '✅ Submit Grades'}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Student ID', 'Name', 'Email', 'Letter Grade', 'Percentage (%)', 'Comments', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const g = grades[s.enrollment_id] || {};
                    const isPublished = s.is_published;
                    return (
                      <tr key={s.enrollment_id} style={{ borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: 13 }}>{i + 1}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{s.student_id}</span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{s.first_name} {s.last_name}</td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: 12 }}>{s.email}</td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={g.letterGrade || ''}
                            onChange={e => handleGradeChange(s.enrollment_id, 'letterGrade', e.target.value)}
                            disabled={isPublished}
                            style={{
                              padding: '6px 10px', border: `2px solid ${g.letterGrade ? (gradeColors[g.letterGrade] + '40') : '#e5e7eb'}`,
                              borderRadius: 6, fontSize: 13, fontWeight: 700,
                              color: g.letterGrade ? gradeColors[g.letterGrade] : '#374151',
                              background: g.letterGrade ? (gradeColors[g.letterGrade] + '10') : 'white',
                              cursor: isPublished ? 'not-allowed' : 'pointer', minWidth: 80
                            }}
                          >
                            <option value="">Select</option>
                            {GRADES.map(gr => <option key={gr} value={gr}>{gr}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="number" min="0" max="100" step="0.1"
                            value={g.percentage || ''}
                            onChange={e => handleGradeChange(s.enrollment_id, 'percentage', e.target.value)}
                            disabled={isPublished}
                            placeholder="e.g. 87.5"
                            style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, width: 90, fontSize: 13, background: isPublished ? '#f9fafb' : 'white' }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="text"
                            value={g.comments || ''}
                            onChange={e => handleGradeChange(s.enrollment_id, 'comments', e.target.value)}
                            disabled={isPublished}
                            placeholder="Optional"
                            style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, width: 160, fontSize: 13, background: isPublished ? '#f9fafb' : 'white' }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          {isPublished ? (
                            <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✅ Published</span>
                          ) : s.grade ? (
                            <span style={{ background: '#fffbeb', color: '#d97706', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>📤 Submitted</span>
                          ) : (
                            <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>⏳ Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                Graded: <strong>{Object.values(grades).filter(g => g.letterGrade).length}</strong> / {students.length} students
              </div>
              <button type="submit" disabled={submitting} style={{
                background: submitting ? '#a7f3d0' : '#10b981', color: 'white', border: 'none',
                padding: '12px 32px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 15
              }}>
                {submitting ? '⏳ Saving...' : '✅ Submit All Grades'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default GradeEntry;
