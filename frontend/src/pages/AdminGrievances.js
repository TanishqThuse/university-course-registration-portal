import React, { useState } from 'react';

const initGrievances = [
  { id: 'GRV-2026-088', student: 'Alice Anderson', dept: 'CSE', category: 'Academic', subject: 'IA marks not updated for CS201', date: '2026-04-27', status: 'open', priority: 'high', response: '' },
  { id: 'GRV-2026-085', student: 'Bob Patel', dept: 'IT', category: 'Hostel', subject: 'Room AC not working since 2 weeks', date: '2026-04-25', status: 'in-progress', priority: 'medium', response: 'Maintenance team has been informed. Will fix within 48 hours.' },
  { id: 'GRV-2026-081', student: 'Charlie Kumar', dept: 'CSE', category: 'Infrastructure', subject: 'Projector broken in LH-301', date: '2026-04-22', status: 'resolved', priority: 'low', response: 'Projector replaced on Apr 24.' },
  { id: 'GRV-2026-079', student: 'Diana Sharma', dept: 'AIML', category: 'Faculty', subject: 'Request for extra doubt-clearing session', date: '2026-04-20', status: 'resolved', priority: 'low', response: 'Faculty agreed to hold extra sessions on Fridays 4-5 PM.' },
  { id: 'GRV-2026-076', student: 'Ethan Singh', dept: 'EXTC', category: 'Administrative', subject: 'Bonafide certificate not generated', date: '2026-04-18', status: 'open', priority: 'high', response: '' },
  { id: 'GRV-2026-072', student: 'Anonymous', dept: '—', category: 'Ragging', subject: 'Verbal harassment in hostel block D', date: '2026-04-15', status: 'in-progress', priority: 'critical', response: 'Anti-Ragging Committee has been notified. Investigation in progress.' },
];

const statusColors = {
  open: { bg: '#fef2f2', text: '#dc2626', label: '🔴 Open' },
  'in-progress': { bg: '#fffbeb', text: '#d97706', label: '🟡 In Progress' },
  resolved: { bg: '#f0fdf4', text: '#16a34a', label: '🟢 Resolved' },
};
const prioColors = { critical: '#7f1d1d', high: '#dc2626', medium: '#d97706', low: '#6b7280' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };

function AdminGrievances() {
  const [grievances, setGrievances] = useState(initGrievances);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [assignee, setAssignee] = useState('');
  const [toast, setToast] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const markResolved = (id) => {
    setGrievances(g => g.map(x => x.id === id ? { ...x, status: 'resolved' } : x));
    setModal(null);
    showToast('✅ Grievance marked as resolved!');
  };

  const handleReply = () => {
    if (!reply.trim()) return;
    setGrievances(g => g.map(x => x.id === selected.id ? { ...x, response: reply, status: 'in-progress' } : x));
    setModal(null); setReply('');
    showToast('📨 Reply sent to student!');
  };

  const handleAssign = () => {
    if (!assignee.trim()) return;
    setGrievances(g => g.map(x => x.id === selected.id ? { ...x, assignedTo: assignee, status: 'in-progress' } : x));
    setModal(null); setAssignee('');
    showToast(`✅ Grievance assigned to ${assignee}!`);
  };

  const displayed = filterStatus === 'all' ? grievances : grievances.filter(g => g.status === filterStatus);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, background: '#111827', color: 'white', padding: '12px 20px', borderRadius: 10, zIndex: 2000, fontSize: 14, fontWeight: 600 }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📣 Grievance Management</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Review and resolve student grievances and complaints</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total', count: grievances.length, color: '#6366f1', key: 'all' },
          { label: 'Open', count: grievances.filter(g => g.status === 'open').length, color: '#dc2626', key: 'open' },
          { label: 'In Progress', count: grievances.filter(g => g.status === 'in-progress').length, color: '#d97706', key: 'in-progress' },
          { label: 'Resolved', count: grievances.filter(g => g.status === 'resolved').length, color: '#16a34a', key: 'resolved' },
        ].map((s, i) => (
          <div key={i} onClick={() => setFilterStatus(s.key)} style={{
            background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderTop: `4px solid ${s.color}`, cursor: 'pointer',
            border: `2px solid ${filterStatus === s.key ? s.color : 'transparent'}`, transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayed.map(g => {
            const sc = statusColors[g.status];
            return (
              <div key={g.id} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px', borderLeft: `4px solid ${prioColors[g.priority]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{g.id}</span>
                    <span style={{ background: `${prioColors[g.priority]}20`, color: prioColors[g.priority], padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{g.priority}</span>
                    <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{g.category}</span>
                  </div>
                  <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{sc.label}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{g.subject}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>📅 {g.date} · 👤 {g.student} · 🏛️ {g.dept}</div>
                {g.response && (
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#374151', marginBottom: 10 }}>
                    <strong>Response:</strong> {g.response}
                  </div>
                )}
                {g.assignedTo && (
                  <div style={{ fontSize: 12, color: '#6366f1', marginBottom: 8 }}>👤 Assigned to: <strong>{g.assignedTo}</strong></div>
                )}
                {g.status !== 'resolved' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button onClick={() => { setSelected(g); setModal('resolve'); }} style={{ background: '#10b981', color: 'white', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✅ Mark Resolved</button>
                    <button onClick={() => { setSelected(g); setAssignee(g.assignedTo || ''); setModal('assign'); }} style={{ background: '#eef2ff', color: '#6366f1', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>👤 Assign To</button>
                    <button onClick={() => { setSelected(g); setReply(g.response || ''); setModal('reply'); }} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>💬 Reply</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolve Modal */}
      {modal === 'resolve' && selected && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#111827' }}>Mark as Resolved?</h2>
            <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>"{selected.subject}"</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => markResolved(selected.id)} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Yes, Resolve</button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {modal === 'reply' && selected && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 500 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: '#111827' }}>💬 Reply to Student</h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Replying to: <strong>{selected.student}</strong> — {selected.subject}</p>
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={5} placeholder="Type your response here..."
              style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleReply} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Send Reply</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {modal === 'assign' && selected && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 420 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#111827' }}>👤 Assign Grievance</h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>{selected.subject}</p>
            <select value={assignee} onChange={e => setAssignee(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
              <option value="">-- Select Staff Member --</option>
              <option value="Dean of Students">Dean of Students</option>
              <option value="HOD - CSE">HOD - CSE</option>
              <option value="Hostel Warden">Hostel Warden</option>
              <option value="Anti-Ragging Committee">Anti-Ragging Committee</option>
              <option value="Exam Controller">Exam Controller</option>
              <option value="Administrative Officer">Administrative Officer</option>
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleAssign} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGrievances;
