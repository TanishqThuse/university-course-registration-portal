import React, { useState } from 'react';

const assignmentsData = [
  { id: 1, subject: 'Data Structures', code: 'CS201', title: 'Implement AVL Tree with rotations', due: '2026-05-05', status: 'pending', marks: 20, type: 'Coding' },
  { id: 2, subject: 'Machine Learning', code: 'CS401', title: 'Linear Regression from scratch using NumPy', due: '2026-05-08', status: 'submitted', marks: 25, type: 'Lab' },
  { id: 3, subject: 'DBMS', code: 'CS301', title: 'Design ER Diagram for Hospital Management', due: '2026-05-03', status: 'graded', grade: '23/25', marks: 25, type: 'Design' },
  { id: 4, subject: 'Computer Networks', code: 'CS302', title: 'Simulate TCP Three-way Handshake', due: '2026-05-12', status: 'pending', marks: 15, type: 'Simulation' },
  { id: 5, subject: 'Software Engineering', code: 'CS601', title: 'Write SRS Document for Library System', due: '2026-04-30', status: 'overdue', marks: 20, type: 'Document' },
];

const statusConfig = {
  pending: { bg: '#fffbeb', text: '#d97706', label: '⏳ Pending' },
  submitted: { bg: '#eff6ff', text: '#2563eb', label: '📤 Submitted' },
  graded: { bg: '#f0fdf4', text: '#16a34a', label: '✅ Graded' },
  overdue: { bg: '#fef2f2', text: '#dc2626', label: '❌ Overdue' },
};

function Assignments() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? assignmentsData : assignmentsData.filter(a => a.status === filter);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📝 Assignments</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Track all your assignments and submissions</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total', count: assignmentsData.length, color: '#6366f1', bg: '#eef2ff', key: 'all' },
          { label: 'Pending', count: assignmentsData.filter(a => a.status === 'pending').length, color: '#d97706', bg: '#fffbeb', key: 'pending' },
          { label: 'Submitted', count: assignmentsData.filter(a => a.status === 'submitted').length, color: '#2563eb', bg: '#eff6ff', key: 'submitted' },
          { label: 'Overdue', count: assignmentsData.filter(a => a.status === 'overdue').length, color: '#dc2626', bg: '#fef2f2', key: 'overdue' },
        ].map((s, i) => (
          <div key={i} onClick={() => setFilter(s.key)} style={{
            background: s.bg, borderRadius: 12, padding: '20px', cursor: 'pointer',
            border: `2px solid ${filter === s.key ? s.color : 'transparent'}`, transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Assignments</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => {
            const sc = statusConfig[a.status];
            const daysLeft = Math.ceil((new Date(a.due) - new Date()) / 86400000);
            return (
              <div key={a.id} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{a.code}</span>
                    <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{a.type}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{a.subject} · {a.marks} marks</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 150 }}>
                  <div style={{ background: sc.bg, color: sc.text, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, marginBottom: 6, display: 'inline-block' }}>{sc.label}</div>
                  <div style={{ fontSize: 12, color: a.status === 'overdue' ? '#dc2626' : '#6b7280' }}>
                    {a.status === 'graded' ? `Grade: ${a.grade}` : `Due: ${new Date(a.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (${daysLeft}d)`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Assignments;
