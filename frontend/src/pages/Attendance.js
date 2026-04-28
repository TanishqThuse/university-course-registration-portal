import React from 'react';

const subjects = [
  { code: 'CS201', name: 'Data Structures & Algorithms', faculty: 'Dr. R. Sharma', total: 45, present: 40, percent: 89 },
  { code: 'CS301', name: 'Database Management Systems', faculty: 'Dr. R. Sharma', total: 42, present: 38, percent: 90 },
  { code: 'CS401', name: 'Machine Learning', faculty: 'Prof. N. Mehra', total: 40, present: 30, percent: 75 },
  { code: 'CS202', name: 'Object Oriented Programming', faculty: 'Dr. R. Sharma', total: 48, present: 35, percent: 73 },
  { code: 'CS302', name: 'Computer Networks', faculty: 'Prof. N. Mehra', total: 44, present: 41, percent: 93 },
];

function getColor(pct) {
  if (pct >= 85) return { bg: '#f0fdf4', text: '#16a34a', bar: '#22c55e' };
  if (pct >= 75) return { bg: '#fffbeb', text: '#d97706', bar: '#f59e0b' };
  return { bg: '#fef2f2', text: '#dc2626', bar: '#ef4444' };
}

function Attendance() {
  const overall = Math.round(subjects.reduce((s, x) => s + x.percent, 0) / subjects.length);
  const colors = getColor(overall);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>✅ Attendance Tracker</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Spring 2026 · Real-time attendance monitoring</p>
      </div>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: `4px solid ${colors.bar}` }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: colors.text }}>{overall}%</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Overall Attendance</div>
          {overall < 75 && <div style={{ marginTop: 8, background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>⚠️ Below Required 75%</div>}
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: '4px solid #6366f1' }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#6366f1' }}>{subjects.reduce((s, x) => s + x.present, 0)}</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Classes Attended</div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#f59e0b' }}>{subjects.reduce((s, x) => s + x.total - x.present, 0)}</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Classes Missed</div>
        </div>
      </div>

      {/* Subject-wise */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#111827' }}>📊 Subject-wise Attendance</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {subjects.map((s, i) => {
            const c = getColor(s.percent);
            const canMiss = Math.max(0, Math.floor(s.total * 0.25 - (s.total - s.present)));
            const needAttend = s.percent < 75 ? Math.ceil((0.75 * s.total - s.present) / 0.25) : 0;
            return (
              <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>{s.code}</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{s.name}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>👨‍🏫 {s.faculty}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: c.text }}>{s.percent}%</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{s.present}/{s.total} classes</div>
                  </div>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${s.percent}%`, height: '100%', background: c.bar, borderRadius: 100, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  {needAttend > 0 ? (
                    <span style={{ fontSize: 12, color: '#dc2626' }}>⚠️ Attend {needAttend} more consecutive classes to reach 75%</span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#16a34a' }}>✅ Can miss {canMiss} more class{canMiss !== 1 ? 'es' : ''} and stay above 75%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Attendance;
