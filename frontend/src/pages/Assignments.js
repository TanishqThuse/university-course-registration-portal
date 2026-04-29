import React, { useState } from 'react';

const initAssignments = [
  { id: 1, subject: 'Data Structures', code: 'CS201', title: 'Implement AVL Tree with rotations', due: '2026-05-05', status: 'pending', marks: 20, type: 'Coding', file: null },
  { id: 2, subject: 'Machine Learning', code: 'CS401', title: 'Linear Regression from scratch using NumPy', due: '2026-05-08', status: 'submitted', marks: 25, type: 'Lab', file: 'linear_regression.ipynb' },
  { id: 3, subject: 'DBMS', code: 'CS301', title: 'Design ER Diagram for Hospital Management', due: '2026-05-03', status: 'graded', grade: '23/25', marks: 25, type: 'Design', file: 'er_diagram.pdf' },
  { id: 4, subject: 'Computer Networks', code: 'CS302', title: 'Simulate TCP Three-way Handshake', due: '2026-05-12', status: 'pending', marks: 15, type: 'Simulation', file: null },
  { id: 5, subject: 'Software Engineering', code: 'CS601', title: 'Write SRS Document for Library System', due: '2026-04-30', status: 'overdue', marks: 20, type: 'Document', file: null },
];

const statusConfig = {
  pending: { bg: '#fffbeb', text: '#d97706', label: '⏳ Pending' },
  submitted: { bg: '#eff6ff', text: '#2563eb', label: '📤 Submitted' },
  graded: { bg: '#f0fdf4', text: '#16a34a', label: '✅ Graded' },
  overdue: { bg: '#fef2f2', text: '#dc2626', label: '❌ Overdue' },
};

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };

function Assignments() {
  const [assignments, setAssignments] = useState(initAssignments);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);

  const openSubmit = (a) => { setSelected(a); setFileName(''); setModal('submit'); };

  const handleSubmit = () => {
    if (!fileName.trim()) { showToast('⚠️ Please enter a file name.'); return; }
    setSubmitting(true);
    setTimeout(() => {
      setAssignments(prev => prev.map(a => a.id === selected.id ? { ...a, status: 'submitted', file: fileName } : a));
      setSubmitting(false);
      setModal('success');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, background: '#111827', color: 'white', padding: '12px 20px', borderRadius: 10, zIndex: 2000, fontSize: 14, fontWeight: 600 }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📝 Assignments</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Track and submit your assignments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total', count: assignments.length, color: '#6366f1', key: 'all' },
          { label: 'Pending', count: assignments.filter(a => a.status === 'pending').length, color: '#d97706', key: 'pending' },
          { label: 'Submitted', count: assignments.filter(a => a.status === 'submitted').length, color: '#2563eb', key: 'submitted' },
          { label: 'Overdue', count: assignments.filter(a => a.status === 'overdue').length, color: '#dc2626', key: 'overdue' },
        ].map((s, i) => (
          <div key={i} onClick={() => setFilter(s.key)} style={{
            background: 'white', borderRadius: 12, padding: '20px', cursor: 'pointer',
            border: `2px solid ${filter === s.key ? s.color : 'transparent'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}`, transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>All Assignments</h2>
          <button onClick={() => setFilter('all')} style={{ background: 'none', border: '1px solid #e5e7eb', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Show All</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => {
            const sc = statusConfig[a.status];
            const daysLeft = Math.ceil((new Date(a.due) - new Date()) / 86400000);
            return (
              <div key={a.id} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{a.code}</span>
                      <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{a.type}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{a.subject} · {a.marks} marks</div>
                    {a.file && <div style={{ fontSize: 12, color: '#6366f1', marginTop: 4 }}>📎 {a.file}</div>}
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 160 }}>
                    <div style={{ background: sc.bg, color: sc.text, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, marginBottom: 6, display: 'inline-block' }}>{sc.label}</div>
                    <div style={{ fontSize: 12, color: a.status === 'overdue' ? '#dc2626' : daysLeft <= 2 ? '#d97706' : '#6b7280', marginBottom: 8 }}>
                      {a.status === 'graded' ? `Grade: ${a.grade}` : `Due: ${new Date(a.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (${daysLeft}d)`}
                    </div>
                    {(a.status === 'pending' || a.status === 'overdue') && (
                      <button onClick={() => openSubmit(a)} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        📤 Submit
                      </button>
                    )}
                    {a.status === 'submitted' && (
                      <button onClick={() => openSubmit(a)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        🔄 Resubmit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Modal */}
      {modal === 'submit' && selected && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 480 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#111827' }}>📤 Submit Assignment</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>{selected.title}</p>
            <div style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: 24, textAlign: 'center', marginBottom: 20, background: '#f9fafb' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
              <p style={{ color: '#374151', fontWeight: 600, marginBottom: 4 }}>Upload Your File</p>
              <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12 }}>PDF, DOCX, ZIP, IPYNB supported</p>
              <input
                type="text"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                placeholder="Enter filename (e.g. avl_tree_solution.py)"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: submitting ? '#a5b4fc' : '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                {submitting ? '⏳ Uploading...' : '📤 Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {modal === 'success' && (
        <div style={modalOverlay}>
          <div style={{ background: 'white', borderRadius: 16, padding: 40, width: 380, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>Submitted Successfully!</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Your assignment "{selected?.title}" has been submitted. The faculty will review and grade it shortly.</p>
            <button onClick={() => setModal(null)} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assignments;
