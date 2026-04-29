import React from 'react';

const schedule = {
  Mon: [
    { time: '9:00–10:00', subject: 'Data Structures', code: 'CS201', room: 'LH-301', section: 'A', students: 58, color: '#10b981' },
    { time: '1:00–2:00', subject: 'Web Technologies', code: 'IT301', room: 'LH-202', section: 'A', students: 47, color: '#6366f1' },
  ],
  Tue: [
    { time: '8:00–9:00', subject: 'OOP with Java', code: 'CS202', room: 'LH-201', section: 'B', students: 55, color: '#d97706' },
    { time: '10:30–12:00', subject: 'DBMS', code: 'CS301', room: 'LH-302', section: 'A', students: 52, color: '#dc2626' },
  ],
  Wed: [
    { time: '9:00–10:00', subject: 'Data Structures', code: 'CS201', room: 'LH-301', section: 'A', students: 58, color: '#10b981' },
    { time: '2:00–4:00', subject: 'DS Lab', code: 'CS201L', room: 'Lab-1', section: 'A', students: 30, color: '#059669' },
  ],
  Thu: [
    { time: '8:00–9:00', subject: 'OOP with Java', code: 'CS202', room: 'LH-201', section: 'B', students: 55, color: '#d97706' },
    { time: '10:30–12:00', subject: 'DBMS', code: 'CS301', room: 'LH-302', section: 'A', students: 52, color: '#dc2626' },
  ],
  Fri: [
    { time: '9:00–10:00', subject: 'Data Structures', code: 'CS201', room: 'LH-301', section: 'A', students: 58, color: '#10b981' },
    { time: '1:00–2:00', subject: 'Web Technologies', code: 'IT301', room: 'LH-202', section: 'A', students: 47, color: '#6366f1' },
    { time: '2:00–5:00', subject: 'Software Engineering', code: 'CS601', room: 'LH-304', section: 'A', students: 42, color: '#7c3aed' },
  ],
};

const officeHours = [
  { day: 'Tuesday', time: '2:00–4:00 PM', location: 'Office 302, CSE Building' },
  { day: 'Thursday', time: '2:00–4:00 PM', location: 'Office 302, CSE Building' },
];

function FacultySchedule() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📅 My Teaching Schedule</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Spring 2026 · Computer Science & Engineering</p>
      </div>

      {/* Office Hours */}
      <div style={{ background: 'linear-gradient(135deg, #065f46, #10b981)', borderRadius: 12, padding: 20, marginBottom: 24, color: 'white' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🕐 Office Hours</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          {officeHours.map((o, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{o.day}</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{o.time}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>📍 {o.location}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {Object.entries(schedule).map(([day, slots]) => (
          <div key={day}>
            <div style={{
              background: 'linear-gradient(135deg, #065f46, #047857)', color: 'white',
              borderRadius: 10, padding: '12px 16px', textAlign: 'center',
              fontWeight: 700, fontSize: 15, marginBottom: 10
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{s.subject}</div>
                  <div style={{ fontSize: 11, background: `${s.color}18`, color: s.color, padding: '2px 6px', borderRadius: 4, display: 'inline-block', fontWeight: 600 }}>{s.code} · Sec {s.section}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>📍 {s.room} · 👥 {s.students}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FacultySchedule;
