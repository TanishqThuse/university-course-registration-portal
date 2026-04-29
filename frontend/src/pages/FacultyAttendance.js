import React, { useState } from 'react';

const courses = [
  { code: 'CS201', name: 'Data Structures', section: 'A' },
  { code: 'CS301', name: 'DBMS', section: 'A' },
  { code: 'CS202', name: 'OOP with Java', section: 'B' },
  { code: 'IT301', name: 'Web Technologies', section: 'A' },
  { code: 'CS601', name: 'Software Engineering', section: 'A' },
];

const studentsDB = {
  'CS201': [
    { id: 'STU2023001', name: 'Alice Anderson', present: 40, total: 45 },
    { id: 'STU2023002', name: 'Bob Patel', present: 38, total: 45 },
    { id: 'STU2023003', name: 'Charlie Kumar', present: 30, total: 45 },
    { id: 'STU2023004', name: 'Diana Sharma', present: 42, total: 45 },
    { id: 'STU2023005', name: 'Ethan Singh', present: 35, total: 45 },
    { id: 'STU2023006', name: 'Fiona Reddy', present: 44, total: 45 },
    { id: 'STU2023007', name: 'Gaurav Joshi', present: 28, total: 45 },
    { id: 'STU2023008', name: 'Harini Nair', present: 41, total: 45 },
  ],
  'CS301': [
    { id: 'STU2023001', name: 'Alice Anderson', present: 38, total: 42 },
    { id: 'STU2023009', name: 'Isha Gupta', present: 40, total: 42 },
    { id: 'STU2023010', name: 'Jay Mehta', present: 25, total: 42 },
    { id: 'STU2023011', name: 'Kavya Desai', present: 39, total: 42 },
  ],
};

function FacultyAttendance() {
  const [selectedCourse, setSelectedCourse] = useState('CS201');
  const [todayMarked, setTodayMarked] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const students = studentsDB[selectedCourse] || studentsDB['CS201'];

  const handleMark = (id, status) => {
    setTodayMarked(prev => ({ ...prev, [id]: status }));
  };

  const handleSubmit = () => {
    const marked = Object.keys(todayMarked).length;
    if (marked < students.length) {
      alert(`Please mark attendance for all ${students.length} students. You've marked ${marked}.`);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>✅ Mark Attendance</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Course selector */}
      <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <label style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 8, display: 'block' }}>Select Course</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {courses.map(c => (
            <button key={c.code} onClick={() => { setSelectedCourse(c.code); setTodayMarked({}); setSubmitted(false); }}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: selectedCourse === c.code ? '#10b981' : '#f3f4f6',
                color: selectedCourse === c.code ? 'white' : '#374151',
                transition: 'all 0.2s'
              }}>{c.code} — {c.name}</button>
          ))}
        </div>
      </div>

      {submitted ? (
        <div style={{ background: 'white', borderRadius: 12, padding: '60px 40px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#16a34a', marginBottom: 8 }}>Attendance Submitted!</h2>
          <p style={{ color: '#6b7280', marginBottom: 4 }}>Course: {selectedCourse} · Date: {new Date().toLocaleDateString('en-IN')}</p>
          <p style={{ color: '#374151' }}>Present: <strong>{Object.values(todayMarked).filter(v => v === 'present').length}</strong> · Absent: <strong>{Object.values(todayMarked).filter(v => v === 'absent').length}</strong></p>
          <button onClick={() => { setSubmitted(false); setTodayMarked({}); }} style={{ marginTop: 20, background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Mark Another Course</button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Students — {selectedCourse}</h2>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{Object.keys(todayMarked).length}/{students.length} marked</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'Student ID', 'Name', 'Attendance (till now)', 'Today'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const pct = Math.round((s.present / s.total) * 100);
                const pctColor = pct >= 85 ? '#16a34a' : pct >= 75 ? '#d97706' : '#dc2626';
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', color: '#6b7280' }}>{i + 1}</td>
                    <td style={{ padding: '12px' }}><span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>{s.id}</span></td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>{s.name}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ background: '#f3f4f6', borderRadius: 100, height: 6, flex: 1, maxWidth: 100 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pctColor, borderRadius: 100 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: pctColor }}>{pct}%</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>({s.present}/{s.total})</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleMark(s.id, 'present')} style={{
                          padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          background: todayMarked[s.id] === 'present' ? '#16a34a' : '#f0fdf4', color: todayMarked[s.id] === 'present' ? 'white' : '#16a34a'
                        }}>P</button>
                        <button onClick={() => handleMark(s.id, 'absent')} style={{
                          padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          background: todayMarked[s.id] === 'absent' ? '#dc2626' : '#fef2f2', color: todayMarked[s.id] === 'absent' ? 'white' : '#dc2626'
                        }}>A</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Present: <strong style={{ color: '#16a34a' }}>{Object.values(todayMarked).filter(v => v === 'present').length}</strong> · 
              Absent: <strong style={{ color: '#dc2626' }}>{Object.values(todayMarked).filter(v => v === 'absent').length}</strong>
            </div>
            <button onClick={handleSubmit} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Submit Attendance</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyAttendance;
