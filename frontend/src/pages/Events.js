import React, { useState } from 'react';

const initEvents = [
  { id: 1, title: 'Innovex 2026 — Annual Tech Fest', date: '2026-05-10', location: 'Main Auditorium', type: 'Tech', status: 'open', desc: 'Participate in hackathons, paper presentations, and project expo.', seats: 200, registered: 147 },
  { id: 2, title: 'Industry Expert Talk: AI in Healthcare', date: '2026-05-06', location: 'Seminar Hall 1', type: 'Seminar', status: 'open', desc: 'Dr. Priya Patel from TCS Research speaks on AI applications in medicine.', seats: 100, registered: 82 },
  { id: 3, title: 'Inter-College Cricket Tournament', date: '2026-05-14', location: 'Sports Ground', type: 'Sports', status: 'open', desc: 'Register your team before May 10. 6 colleges participating.', seats: 60, registered: 48 },
  { id: 4, title: 'Resume Building & LinkedIn Workshop', date: '2026-05-03', location: 'LH-501', type: 'Career', status: 'registered', desc: 'Conducted by TPO Cell. Mandatory for final year students.', seats: 80, registered: 80 },
  { id: 5, title: 'Blood Donation Camp', date: '2026-05-07', location: 'Ground Floor Foyer', type: 'Social', status: 'open', desc: 'Annual NSS blood donation drive. Get volunteer certificate.', seats: 500, registered: 210 },
];

const certificates = [
  { title: 'Python for Data Science — Coursera', date: '2026-02-15', issuer: 'Coursera / IBM', type: 'Online Course', id: 'CERT-2026-IBM-001' },
  { title: 'Best Project Award — Innovex 2025', date: '2025-05-12', issuer: 'CampusConnect University', type: 'Achievement', id: 'CERT-2025-INNO-042' },
  { title: 'Volunteer Certificate — Blood Donation 2025', date: '2025-09-08', issuer: 'NSS Cell', type: 'Volunteer', id: 'CERT-2025-NSS-017' },
];

const typeColors = { Tech: '#6366f1', Seminar: '#0891b2', Sports: '#16a34a', Career: '#d97706', Social: '#db2777' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };

function Events() {
  const [events, setEvents] = useState(initEvents);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleRegister = (id) => {
    setEvents(evs => evs.map(e => e.id === id ? { ...e, status: 'registered', registered: e.registered + 1 } : e));
    setModal(null);
    showToast('🎉 Successfully registered for the event!');
  };

  const openRegModal = (ev) => { setSelected(ev); setModal('register'); };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, background: '#111827', color: 'white', padding: '12px 20px', borderRadius: 10, zIndex: 2000, fontSize: 14, fontWeight: 600 }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>🎉 Events & Certificates</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Upcoming events and your achievement certificates</p>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>📅 Upcoming Events</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((e) => {
            const tc = typeColors[e.type] || '#6366f1';
            const daysLeft = Math.ceil((new Date(e.date) - new Date()) / 86400000);
            const fillPct = Math.round((e.registered / e.seats) * 100);
            const isFull = e.registered >= e.seats;
            return (
              <div key={e.id} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px', borderLeft: `4px solid ${tc}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ background: `${tc}18`, color: tc, padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{e.type}</span>
                      {e.status === 'registered' && <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>✅ Registered</span>}
                      {isFull && e.status !== 'registered' && <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>🔴 Full</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{e.title}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>📍 {e.location} · {e.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: '#f3f4f6', borderRadius: 100, height: 5, flex: 1, maxWidth: 120 }}>
                        <div style={{ width: `${fillPct}%`, height: '100%', background: fillPct >= 90 ? '#dc2626' : tc, borderRadius: 100 }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>{e.registered}/{e.seats} registered</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 140, marginLeft: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div style={{ fontSize: 12, color: daysLeft <= 3 ? '#dc2626' : '#6b7280', marginBottom: 8 }}>{daysLeft} days left</div>
                    {e.status === 'registered' ? (
                      <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>✅ Enrolled</span>
                    ) : isFull ? (
                      <button disabled style={{ background: '#f3f4f6', color: '#9ca3af', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'not-allowed', fontSize: 12, fontWeight: 600 }}>Full</button>
                    ) : (
                      <button onClick={() => openRegModal(e)} style={{ background: tc, color: 'white', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Register →</button>
                    )}
                  </div>
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
              <button onClick={() => showToast(`📄 Downloading ${c.id}...`)}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, width: '100%' }}>⬇️ Download Certificate</button>
            </div>
          ))}
        </div>
      </div>

      {/* Register Modal */}
      {modal === 'register' && selected && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 460 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎫</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#111827' }}>Register for Event</h2>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{selected.title}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>📅 {new Date(selected.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>📍 {selected.location}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>🪑 {selected.seats - selected.registered} seats remaining</div>
            </div>
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 20, background: '#fffbeb', padding: 12, borderRadius: 8 }}>
              ⚠️ By registering, you confirm your attendance. Absentees may be marked accordingly.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => handleRegister(selected.id)} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: typeColors[selected.type] || '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Confirm Registration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
