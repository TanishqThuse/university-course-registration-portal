import React, { useState } from 'react';

const announcements = [
  { id: 1, title: 'End Semester Exam Schedule Released', body: 'The exam timetable for Spring 2026 has been published. Students can view it under Examinations tab.', audience: 'All', date: '2026-04-28', priority: 'high' },
  { id: 2, title: 'Registration Deadline Extended to May 15', body: 'Due to high demand, course registration deadline has been extended by one week.', audience: 'Students', date: '2026-04-25', priority: 'medium' },
  { id: 3, title: 'Faculty Meeting — May 2, 10 AM', body: 'All faculty members are requested to attend the monthly review meeting in Conference Hall A.', audience: 'Faculty', date: '2026-04-22', priority: 'low' },
  { id: 4, title: 'Campus WiFi Maintenance — May 3', body: 'WiFi will be unavailable from 2 AM to 6 AM on May 3 due to scheduled maintenance.', audience: 'All', date: '2026-04-20', priority: 'medium' },
];

function AdminAnnouncements() {
  const [form, setForm] = useState({ title: '', body: '', audience: 'All', priority: 'medium' });
  const [list, setList] = useState(announcements);
  const [showForm, setShowForm] = useState(false);

  const handlePost = (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return;
    setList([{ ...form, id: list.length + 1, date: new Date().toISOString().split('T')[0] }, ...list]);
    setForm({ title: '', body: '', audience: 'All', priority: 'medium' });
    setShowForm(false);
  };

  const pColors = { high: { bg: '#fef2f2', text: '#dc2626' }, medium: { bg: '#fffbeb', text: '#d97706' }, low: { bg: '#f0fdf4', text: '#16a34a' } };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📢 Announcements</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>Broadcast messages to students, faculty, or everyone</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          {showForm ? '✕ Cancel' : '+ New Announcement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handlePost} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, color: '#111827' }}>Create Announcement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title..." style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Announcement body..." rows={3} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, flex: 1 }}>
                <option value="All">All</option><option value="Students">Students</option><option value="Faculty">Faculty</option>
              </select>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, flex: 1 }}>
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <button type="submit" style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Publish Announcement</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map(a => {
          const pc = pColors[a.priority];
          return (
            <div key={a.id} style={{ background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${pc.text}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ background: pc.bg, color: pc.text, padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{a.priority.toUpperCase()}</span>
                  <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{a.audience}</span>
                </div>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{a.date}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{a.title}</div>
              <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>{a.body}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminAnnouncements;
