import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'P', 'NP', 'W', 'I'];
const gradeColors = {
  A: '#16a34a', 'A-': '#16a34a', 'B+': '#2563eb', B: '#2563eb', 'B-': '#2563eb',
  'C+': '#d97706', C: '#d97706', 'C-': '#d97706', 'D+': '#dc2626', D: '#dc2626',
  F: '#7f1d1d', P: '#6366f1', NP: '#6b7280', W: '#6b7280', I: '#6b7280'
};

// Demo offerings shown when DB has no data
const DEMO_OFFERINGS = [
  { id: 'demo-1', course_code: 'CS201', course_name: 'Data Structures & Algorithms', section: 'A', schedule_days: 'Mon,Wed,Fri', start_time: '09:00', end_time: '10:00', room_number: 'LH-301', current_enrollment: 5, max_capacity: 60 },
  { id: 'demo-2', course_code: 'CS301', course_name: 'Database Management Systems', section: 'A', schedule_days: 'Tue,Thu', start_time: '10:30', end_time: '12:00', room_number: 'LH-302', current_enrollment: 4, max_capacity: 55 },
  { id: 'demo-3', course_code: 'CS601', course_name: 'Software Engineering', section: 'A', schedule_days: 'Fri', start_time: '14:00', end_time: '17:00', room_number: 'LH-304', current_enrollment: 6, max_capacity: 55 },
];

// Demo students for each demo offering
const DEMO_STUDENTS = {
  'demo-1': [
    { enrollment_id: 1001, student_id: 'STU2023001', first_name: 'Alice', last_name: 'Anderson', email: 'alice.anderson@student.edu', grade: null, is_published: false },
    { enrollment_id: 1002, student_id: 'STU2023002', first_name: 'Bob', last_name: 'Patel', email: 'bob.patel@student.edu', grade: null, is_published: false },
    { enrollment_id: 1003, student_id: 'STU2023003', first_name: 'Charlie', last_name: 'Kumar', email: 'charlie.kumar@student.edu', grade: 'A', is_published: true },
    { enrollment_id: 1004, student_id: 'STU2023004', first_name: 'Diana', last_name: 'Sharma', email: 'diana.sharma@student.edu', grade: null, is_published: false },
    { enrollment_id: 1005, student_id: 'STU2024001', first_name: 'Etan', last_name: 'Verma', email: 'etan.verma@student.edu', grade: null, is_published: false },
  ],
  'demo-2': [
    { enrollment_id: 2001, student_id: 'STU2023001', first_name: 'Alice', last_name: 'Anderson', email: 'alice.anderson@student.edu', grade: 'B+', is_published: true },
    { enrollment_id: 2002, student_id: 'STU2023005', first_name: 'Faiz', last_name: 'Khan', email: 'faiz.khan@student.edu', grade: null, is_published: false },
    { enrollment_id: 2003, student_id: 'STU2023006', first_name: 'Gita', last_name: 'Reddy', email: 'gita.reddy@student.edu', grade: null, is_published: false },
    { enrollment_id: 2004, student_id: 'STU2024002', first_name: 'Hina', last_name: 'Ansari', email: 'hina.ansari@student.edu', grade: null, is_published: false },
  ],
  'demo-3': [
    { enrollment_id: 3001, student_id: 'STU2023002', first_name: 'Bob', last_name: 'Patel', email: 'bob.patel@student.edu', grade: null, is_published: false },
    { enrollment_id: 3002, student_id: 'STU2023003', first_name: 'Charlie', last_name: 'Kumar', email: 'charlie.kumar@student.edu', grade: null, is_published: false },
    { enrollment_id: 3003, student_id: 'STU2023007', first_name: 'Isha', last_name: 'Mehta', email: 'isha.mehta@student.edu', grade: 'B', is_published: false },
    { enrollment_id: 3004, student_id: 'STU2023008', first_name: 'Jai', last_name: 'Singh', email: 'jai.singh@student.edu', grade: null, is_published: false },
    { enrollment_id: 3005, student_id: 'STU2024003', first_name: 'Kavya', last_name: 'Nair', email: 'kavya.nair@student.edu', grade: null, is_published: false },
    { enrollment_id: 3006, student_id: 'STU2024004', first_name: 'Laxman', last_name: 'Rao', email: 'laxman.rao@student.edu', grade: null, is_published: false },
  ],
};

function GradeEntry() {
  const [myOfferings, setMyOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });
  const [usingDemo, setUsingDemo] = useState(false);
  const [submittedIds, setSubmittedIds] = useState(new Set());

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 4000);
  };

  // Load faculty's offerings
  useEffect(() => {
    const fetchOfferings = async () => {
      setOfferingsLoading(true);
      try {
        const res = await api.get('/courses/offerings', { params: { semester: 'Spring', academicYear: 2026 } });
        const all = res.data.data?.offerings || [];
        if (all.length > 0) {
          setUsingDemo(false);
          setMyOfferings(all);
          setSelectedOffering(String(all[0].id));
        } else {
          // No DB data — use demo offerings
          setUsingDemo(true);
          setMyOfferings(DEMO_OFFERINGS);
          setSelectedOffering('demo-1');
        }
      } catch (err) {
        console.warn('API error, using demo offerings:', err.message);
        setUsingDemo(true);
        setMyOfferings(DEMO_OFFERINGS);
        setSelectedOffering('demo-1');
      } finally {
        setOfferingsLoading(false);
      }
    };
    fetchOfferings();
  }, []);

  // Load students when offering changes
  useEffect(() => {
    if (selectedOffering) fetchStudents(selectedOffering);
  }, [selectedOffering]); // eslint-disable-line

  const fetchStudents = async (oId) => {
    setLoading(true);
    setStudents([]);
    try {
      if (usingDemo || String(oId).startsWith('demo-')) {
        // Demo mode
        await new Promise(r => setTimeout(r, 400));
        const demoStu = DEMO_STUDENTS[oId] || [];
        setStudents(demoStu);
        const init = {};
        demoStu.forEach(s => {
          init[s.enrollment_id] = {
            letterGrade: s.grade || '',
            percentage: '',
            comments: ''
          };
        });
        setGrades(init);
      } else {
        const res = await api.get(`/grades/course/${oId}`);
        const data = res.data.data || [];
        if (data.length > 0) {
          setStudents(data);
          const init = {};
          data.forEach(s => {
            init[s.enrollment_id] = {
              letterGrade: s.grade || '',
              percentage: s.percentage || '',
              comments: s.comments || ''
            };
          });
          setGrades(init);
        } else {
          // Real offering but no students yet — try demo fallback for the matching demo key
          const demoKey = myOfferings.findIndex(o => String(o.id) === String(oId));
          const fallbackKey = `demo-${demoKey + 1}`;
          const demoStu = DEMO_STUDENTS[fallbackKey] || DEMO_STUDENTS['demo-1'];
          setStudents(demoStu);
          const init = {};
          demoStu.forEach(s => { init[s.enrollment_id] = { letterGrade: s.grade || '', percentage: '', comments: '' }; });
          setGrades(init);
          setUsingDemo(true);
        }
      }
    } catch (err) {
      console.warn('Grade fetch error, using demo students:', err.message);
      const demoStu = DEMO_STUDENTS['demo-1'];
      setStudents(demoStu);
      const init = {};
      demoStu.forEach(s => { init[s.enrollment_id] = { letterGrade: s.grade || '', percentage: '', comments: '' }; });
      setGrades(init);
      setUsingDemo(true);
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

    if (gradesArray.length === 0) {
      showToast('warning', '⚠️ No grades to submit. Please select at least one grade.');
      return;
    }

    setSubmitting(true);
    try {
      if (usingDemo) {
        // Demo mode — simulate submission
        await new Promise(r => setTimeout(r, 900));
        const newSubmitted = new Set(submittedIds);
        gradesArray.forEach(g => newSubmitted.add(g.enrollmentId));
        setSubmittedIds(newSubmitted);
        showToast('success', `✅ Submitted ${gradesArray.length} grade(s) successfully! (Demo mode — awaiting DB setup)`);
      } else {
        await api.post('/grades', { grades: gradesArray });
        showToast('success', `✅ Successfully submitted ${gradesArray.length} grade(s)! Pending admin approval.`);
        fetchStudents(selectedOffering);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to submit grades');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedInfo = myOfferings.find(o => String(o.id) === String(selectedOffering));
  const gradedCount = Object.values(grades).filter(g => g.letterGrade).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Toast */}
      {toast.text && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: toast.type === 'success' ? '#16a34a' : toast.type === 'warning' ? '#d97706' : '#dc2626',
          color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: 420
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

      {/* Demo banner */}
      {usingDemo && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <div><strong>Demo Mode:</strong> Showing sample courses & students. Grade submissions are simulated. Restart backend to use live data.</div>
        </div>
      )}

      {/* Course Selector */}
      <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10 }}>
          📚 Select Course / Offering
        </label>
        {offeringsLoading ? (
          <div style={{ color: '#6b7280', padding: '10px 0' }}>⏳ Loading your courses...</div>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {myOfferings.map(o => (
              <button key={o.id} onClick={() => setSelectedOffering(String(o.id))}
                style={{
                  padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: String(selectedOffering) === String(o.id) ? '#10b981' : '#f3f4f6',
                  color: String(selectedOffering) === String(o.id) ? 'white' : '#374151',
                  fontWeight: 700, fontSize: 13, transition: 'all 0.2s'
                }}>
                {o.course_code} — {o.course_name}
                <span style={{ marginLeft: 6, opacity: 0.8, fontSize: 11 }}>(Sec {o.section})</span>
              </button>
            ))}
          </div>
        )}
        {selectedInfo && (
          <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
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
          <p style={{ color: '#6b7280', fontSize: 14 }}>Students will appear here once they enroll in this course.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                👥 Student List ({students.length})
                {gradedCount > 0 && (
                  <span style={{ marginLeft: 10, background: '#f0fdf4', color: '#16a34a', fontSize: 13, padding: '3px 10px', borderRadius: 6, fontWeight: 600 }}>
                    {gradedCount} graded
                  </span>
                )}
              </h2>
              <button type="submit" disabled={submitting}
                style={{
                  background: submitting ? '#a7f3d0' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8,
                  cursor: submitting ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14
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
                    const isSubmitted = submittedIds.has(s.enrollment_id);
                    return (
                      <tr key={s.enrollment_id} style={{ borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: 13 }}>{i + 1}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                            {s.student_id}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                          {s.first_name} {s.last_name}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: 12 }}>{s.email}</td>
                        <td style={{ padding: '12px' }}>
                          <select value={g.letterGrade || ''} onChange={e => handleGradeChange(s.enrollment_id, 'letterGrade', e.target.value)}
                            disabled={isPublished || isSubmitted}
                            style={{
                              padding: '6px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                              border: `2px solid ${g.letterGrade ? (gradeColors[g.letterGrade] + '40') : '#e5e7eb'}`,
                              color: g.letterGrade ? gradeColors[g.letterGrade] : '#374151',
                              background: g.letterGrade ? (gradeColors[g.letterGrade] + '10') : 'white',
                              cursor: (isPublished || isSubmitted) ? 'not-allowed' : 'pointer', minWidth: 80
                            }}>
                            <option value="">Select</option>
                            {GRADES.map(gr => <option key={gr} value={gr}>{gr}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input type="number" min="0" max="100" step="0.1"
                            value={g.percentage || ''} onChange={e => handleGradeChange(s.enrollment_id, 'percentage', e.target.value)}
                            disabled={isPublished || isSubmitted} placeholder="e.g. 87.5"
                            style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, width: 90, fontSize: 13, background: (isPublished || isSubmitted) ? '#f9fafb' : 'white' }} />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input type="text" value={g.comments || ''} onChange={e => handleGradeChange(s.enrollment_id, 'comments', e.target.value)}
                            disabled={isPublished || isSubmitted} placeholder="Optional"
                            style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, width: 140, fontSize: 13, background: (isPublished || isSubmitted) ? '#f9fafb' : 'white' }} />
                        </td>
                        <td style={{ padding: '12px' }}>
                          {isPublished ? (
                            <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✅ Published</span>
                          ) : isSubmitted ? (
                            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>📤 Submitted</span>
                          ) : s.grade ? (
                            <span style={{ background: '#fffbeb', color: '#d97706', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>📋 Graded</span>
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

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                Graded: <strong style={{ color: '#111827' }}>{gradedCount}</strong> / {students.length} students
                {gradedCount === students.length && students.length > 0 && (
                  <span style={{ marginLeft: 8, color: '#16a34a', fontWeight: 600 }}>✅ All students graded!</span>
                )}
              </div>
              <button type="submit" disabled={submitting}
                style={{
                  background: submitting ? '#a7f3d0' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', border: 'none', padding: '12px 32px', borderRadius: 8,
                  cursor: submitting ? 'wait' : 'pointer', fontWeight: 700, fontSize: 15
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
