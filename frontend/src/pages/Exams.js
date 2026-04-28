import React from 'react';

const exams = [
  { subject: 'Data Structures', code: 'CS201', date: '2026-05-20', time: '9:00 AM', room: 'Hall A', type: 'End Semester', marks: 100, syllabus: 'All units. Focus on trees, graphs, dynamic programming.' },
  { subject: 'DBMS', code: 'CS301', date: '2026-05-22', time: '2:00 PM', room: 'Hall B', type: 'End Semester', marks: 100, syllabus: 'SQL, normalization up to BCNF, transaction management.' },
  { subject: 'Machine Learning', code: 'CS401', date: '2026-05-25', time: '9:00 AM', room: 'Hall C', type: 'End Semester', marks: 100, syllabus: 'All algorithms taught + project viva.' },
  { subject: 'Computer Networks', code: 'CS302', date: '2026-05-27', time: '2:00 PM', room: 'Hall A', type: 'End Semester', marks: 100, syllabus: 'OSI model, TCP/IP, routing protocols, HTTP.' },
  { subject: 'OOP with Java', code: 'CS202', date: '2026-05-30', time: '9:00 AM', room: 'Hall D', type: 'End Semester', marks: 100, syllabus: 'OOP concepts, design patterns, exception handling.' },
];

const internal = [
  { subject: 'Data Structures', code: 'CS201', date: '2026-05-08', time: '10:30 AM', marks: 30, obtained: 26 },
  { subject: 'DBMS', code: 'CS301', date: '2026-05-09', time: '10:30 AM', marks: 30, obtained: 24 },
  { subject: 'Machine Learning', code: 'CS401', date: '2026-05-10', time: '10:30 AM', marks: 30, obtained: null },
];

function Exams() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📋 Examinations</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Spring 2026 · Exam schedule and results</p>
      </div>

      {/* Internal Assessment Results */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>📊 Internal Assessment (IA) Results</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {internal.map((e, i) => {
            const pct = e.obtained ? Math.round((e.obtained / e.marks) * 100) : null;
            return (
              <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: 5, display: 'inline-block', marginBottom: 8 }}>{e.code}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 8 }}>{e.subject}</div>
                {e.obtained !== null ? (
                  <>
                    <div style={{ fontSize: 32, fontWeight: 800, color: pct >= 75 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626' }}>{e.obtained}/{e.marks}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{pct}%</div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: '#d97706', fontWeight: 600 }}>📅 Scheduled: {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* End Semester */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>🗓️ End Semester Exam Schedule</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {exams.map((e, i) => {
            const daysLeft = Math.ceil((new Date(e.date) - new Date()) / 86400000);
            const urgency = daysLeft <= 7 ? '#dc2626' : daysLeft <= 14 ? '#d97706' : '#16a34a';
            return (
              <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{e.code}</span>
                    <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{e.type}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{e.subject}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>📚 {e.syllabus}</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 160 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{e.time} · {e.room}</div>
                  <div style={{ fontSize: 12, color: urgency, fontWeight: 600, marginTop: 4 }}>{daysLeft} days left</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Exams;
