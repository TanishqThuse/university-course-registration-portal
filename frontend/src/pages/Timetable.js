import React from 'react';

const schedule = {
  Mon: [
    { time: '9:00–10:00', subject: 'Data Structures', code: 'CS201', room: 'LH-301', color: '#6366f1' },
    { time: '11:00–12:00', subject: 'Computer Networks', code: 'CS302', room: 'LH-303', color: '#0891b2' },
    { time: '1:00–2:00', subject: 'Web Technologies', code: 'IT301', room: 'LH-202', color: '#16a34a' },
    { time: '2:00–3:30', subject: 'Machine Learning', code: 'CS401', room: 'LH-401', color: '#7c3aed' },
  ],
  Tue: [
    { time: '8:00–9:00', subject: 'OOP with Java', code: 'CS202', room: 'LH-201', color: '#d97706' },
    { time: '10:30–12:00', subject: 'DBMS', code: 'CS301', room: 'LH-302', color: '#dc2626' },
    { time: '3:00–4:30', subject: 'Deep Learning', code: 'CS501', room: 'LH-501', color: '#db2777' },
  ],
  Wed: [
    { time: '9:00–10:00', subject: 'Data Structures', code: 'CS201', room: 'LH-301', color: '#6366f1' },
    { time: '11:00–12:00', subject: 'Computer Networks', code: 'CS302', room: 'LH-303', color: '#0891b2' },
    { time: '2:00–3:30', subject: 'Machine Learning Lab', code: 'CS401L', room: 'ML-Lab', color: '#7c3aed' },
  ],
  Thu: [
    { time: '8:00–9:00', subject: 'OOP with Java', code: 'CS202', room: 'LH-201', color: '#d97706' },
    { time: '10:30–12:00', subject: 'DBMS', code: 'CS301', room: 'LH-302', color: '#dc2626' },
    { time: '9:00–10:30', subject: 'Cloud Computing', code: 'IT401', room: 'LH-402', color: '#059669' },
  ],
  Fri: [
    { time: '9:00–10:00', subject: 'Data Structures', code: 'CS201', room: 'LH-301', color: '#6366f1' },
    { time: '11:00–12:00', subject: 'Computer Networks', code: 'CS302', room: 'LH-303', color: '#0891b2' },
    { time: '1:00–2:00', subject: 'Web Technologies Lab', code: 'IT301L', room: 'Web-Lab', color: '#16a34a' },
    { time: '2:00–5:00', subject: 'Software Engineering', code: 'CS601', room: 'LH-304', color: '#374151' },
  ],
};

function Timetable() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>🕐 Weekly Timetable</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Spring 2026 · Semester 5 · Computer Science & Engineering</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {Object.entries(schedule).map(([day, slots]) => (
          <div key={day}>
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
              color: 'white', borderRadius: 10, padding: '12px 16px', textAlign: 'center',
              fontWeight: 700, fontSize: 15, marginBottom: 10, boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
            }}>{day}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {slots.map((s, i) => (
                <div key={i} style={{
                  background: 'white', borderRadius: 10, padding: '14px',
                  borderLeft: `4px solid ${s.color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'transform 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>⏰ {s.time}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.3, marginBottom: 4 }}>{s.subject}</div>
                  <div style={{ fontSize: 11, background: `${s.color}18`, color: s.color, padding: '2px 6px', borderRadius: 4, display: 'inline-block', fontWeight: 600 }}>{s.code}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>📍 {s.room}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timetable;
