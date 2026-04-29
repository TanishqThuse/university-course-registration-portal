import React from 'react';

const grievances = [
  { id: 'GRV-2026-088', student: 'Alice Anderson', dept: 'CSE', category: 'Academic', subject: 'IA marks not updated for CS201', date: '2026-04-27', status: 'open', priority: 'high' },
  { id: 'GRV-2026-085', student: 'Bob Patel', dept: 'IT', category: 'Hostel', subject: 'Room AC not working since 2 weeks', date: '2026-04-25', status: 'in-progress', priority: 'medium' },
  { id: 'GRV-2026-081', student: 'Charlie Kumar', dept: 'CSE', category: 'Infrastructure', subject: 'Projector broken in LH-301', date: '2026-04-22', status: 'resolved', priority: 'low' },
  { id: 'GRV-2026-079', student: 'Diana Sharma', dept: 'AIML', category: 'Faculty', subject: 'Request for extra doubt-clearing session', date: '2026-04-20', status: 'resolved', priority: 'low' },
  { id: 'GRV-2026-076', student: 'Ethan Singh', dept: 'EXTC', category: 'Administrative', subject: 'Bonafide certificate not generated', date: '2026-04-18', status: 'open', priority: 'high' },
  { id: 'GRV-2026-072', student: 'Anonymous', dept: '—', category: 'Ragging', subject: 'Verbal harassment in hostel block D', date: '2026-04-15', status: 'in-progress', priority: 'critical' },
];

const statusColors = {
  open: { bg: '#fef2f2', text: '#dc2626', label: '🔴 Open' },
  'in-progress': { bg: '#fffbeb', text: '#d97706', label: '🟡 In Progress' },
  resolved: { bg: '#f0fdf4', text: '#16a34a', label: '🟢 Resolved' },
};

const prioColors = { critical: '#7f1d1d', high: '#dc2626', medium: '#d97706', low: '#6b7280' };

function AdminGrievances() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📣 Grievance Management</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Review and resolve student grievances and complaints</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total', count: grievances.length, color: '#6366f1' },
          { label: 'Open', count: grievances.filter(g => g.status === 'open').length, color: '#dc2626' },
          { label: 'In Progress', count: grievances.filter(g => g.status === 'in-progress').length, color: '#d97706' },
          { label: 'Resolved', count: grievances.filter(g => g.status === 'resolved').length, color: '#16a34a' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {grievances.map(g => {
            const sc = statusColors[g.status];
            return (
              <div key={g.id} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px', borderLeft: `4px solid ${prioColors[g.priority]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{g.id}</span>
                    <span style={{ background: `${prioColors[g.priority]}18`, color: prioColors[g.priority], padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{g.priority}</span>
                    <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{g.category}</span>
                  </div>
                  <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{sc.label}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{g.subject}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>📅 {g.date} · 👤 {g.student} · 🏛️ {g.dept}</div>
                {g.status !== 'resolved' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Mark Resolved</button>
                    <button style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Assign To</button>
                    <button style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Reply</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminGrievances;
