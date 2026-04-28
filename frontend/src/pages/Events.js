import React from 'react';

const events = [
  { title: 'Innovex 2026 — Annual Tech Fest', date: '2026-05-10', location: 'Main Auditorium', type: 'Tech', status: 'registered', desc: 'Participate in hackathons, paper presentations, and project expo.' },
  { title: 'Industry Expert Talk: AI in Healthcare', date: '2026-05-06', location: 'Seminar Hall 1', type: 'Seminar', status: 'open', desc: 'Dr. Priya Patel from TCS Research speaks on AI applications in medicine.' },
  { title: 'Inter-College Cricket Tournament', date: '2026-05-14', location: 'Sports Ground', type: 'Sports', status: 'open', desc: 'Register your team before May 10. 6 colleges participating.' },
  { title: 'Resume Building & LinkedIn Workshop', date: '2026-05-03', location: 'LH-501', type: 'Career', status: 'registered', desc: 'Conducted by TPO Cell. Mandatory for final year students.' },
  { title: 'Blood Donation Camp', date: '2026-05-07', location: 'Ground Floor Foyer', type: 'Social', status: 'open', desc: 'Annual NSS blood donation drive. Get volunteer certificate.' },
];

const certificates = [
  { title: 'Python for Data Science — Coursera', date: '2026-02-15', issuer: 'Coursera / IBM', type: 'Online Course', id: 'CERT-2026-IBM-001' },
  { title: 'Best Project Award — Innovex 2025', date: '2025-05-12', issuer: 'CampusConnect University', type: 'Achievement', id: 'CERT-2025-INNO-042' },
  { title: 'Volunteer Certificate — Blood Donation 2025', date: '2025-09-08', issuer: 'NSS Cell', type: 'Volunteer', id: 'CERT-2025-NSS-017' },
];

const typeColors = { Tech: '#6366f1', Seminar: '#0891b2', Sports: '#16a34a', Career: '#d97706', Social: '#db2777' };

function Events() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>🎉 Events & Certificates</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Upcoming events and your achievement certificates</p>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>📅 Upcoming Events</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((e, i) => {
            const tc = typeColors[e.type] || '#6366f1';
            const daysLeft = Math.ceil((new Date(e.date) - new Date()) / 86400000);
            return (
              <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${tc}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ background: `${tc}18`, color: tc, padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{e.type}</span>
                    {e.status === 'registered' && <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>✅ Registered</span>}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{e.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>📍 {e.location} · {e.desc}</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 140 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{daysLeft} days left</div>
                  {e.status === 'open' && (
                    <button style={{ background: tc, color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Register</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>🏆 My Certificates</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {certificates.map((c, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', color: 'white', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}>{c.type.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{c.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>🏛️ {c.issuer}</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 12 }}>{new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <button style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, width: '100%' }}>Download Certificate</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Events;
