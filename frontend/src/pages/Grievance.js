import React, { useState } from 'react';

const past = [
  { id: 'GRV-2025-042', category: 'Academic', subject: 'No feedback on submitted assignment', status: 'resolved', date: '2025-11-10', response: 'Faculty has been notified. Grades updated within 48 hours.' },
  { id: 'GRV-2025-031', category: 'Hostel', subject: 'Water supply issue in Block C', status: 'resolved', date: '2025-10-05', response: 'Maintenance team fixed the pipe on Oct 7.' },
];

function Grievance() {
  const [form, setForm] = useState({ category: 'Academic', subject: '', message: '', anonymous: false });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return alert('Please fill all fields.');
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📣 Feedback & Grievance</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Submit complaints, feedback, or suggestions anonymously</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Submission Form */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Submit New Grievance</h2>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ color: '#16a34a', marginBottom: 8 }}>Grievance Submitted!</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Your grievance ID: <strong>GRV-2026-{Math.floor(Math.random() * 900) + 100}</strong></p>
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>Expected resolution: 3-5 working days</p>
              <button onClick={() => { setSubmitted(false); setForm({ category: 'Academic', subject: '', message: '', anonymous: false }); }}
                style={{ marginTop: 16, background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Submit Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}>
                  {['Academic', 'Faculty', 'Hostel', 'Infrastructure', 'Administrative', 'Ragging', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Subject</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief subject of your grievance"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Description</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue in detail..." rows={5}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                <input type="checkbox" checked={form.anonymous} onChange={e => setForm({ ...form, anonymous: e.target.checked })} />
                Submit anonymously
              </label>
              <button type="submit" style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
                Submit Grievance
              </button>
            </form>
          )}
        </div>

        {/* Past Grievances */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>📋 My Past Grievances</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {past.map((g, i) => (
              <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{g.id}</span>
                  <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>✅ {g.status}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{g.subject}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>📅 {g.date} · {g.category}</div>
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#374151' }}>
                  <strong>Response:</strong> {g.response}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Grievance;
