import React, { useState } from 'react';

const initJobs = [
  { id: 1, company: 'Google', role: 'SDE Intern', package: '₹80,000/month', deadline: '2026-05-10', type: 'Internship', eligible: true, logo: '🔵', applied: false, shortlisted: false },
  { id: 2, company: 'Microsoft', role: 'Software Engineer', package: '₹18 LPA', deadline: '2026-05-15', type: 'Full-time', eligible: true, logo: '🟦', applied: false, shortlisted: false },
  { id: 3, company: 'Infosys', role: 'Systems Engineer', package: '₹4.5 LPA', deadline: '2026-05-05', type: 'Full-time', eligible: true, logo: '🔷', applied: true, shortlisted: true },
  { id: 4, company: 'NVIDIA', role: 'Deep Learning Intern', package: '₹1,20,000/month', deadline: '2026-05-20', type: 'Internship', eligible: false, logo: '🟢', applied: false, shortlisted: false },
  { id: 5, company: 'Flipkart', role: 'Backend Engineer', package: '₹14 LPA', deadline: '2026-05-25', type: 'Full-time', eligible: true, logo: '🟡', applied: true, shortlisted: false },
];

const initGoals = [
  { id: 1, goal: 'Achieve 9.0+ CGPA', progress: 75, target: '2026-May', status: 'on-track' },
  { id: 2, goal: 'Complete AWS Cloud Practitioner', progress: 40, target: '2026-Apr', status: 'at-risk' },
  { id: 3, goal: 'Build 3 GitHub Projects', progress: 67, target: '2026-Jun', status: 'on-track' },
  { id: 4, goal: 'Crack Google SDE Interview', progress: 20, target: '2026-Dec', status: 'on-track' },
];

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };

function CareerPortal() {
  const [jobs, setJobs] = useState(initJobs);
  const [goals, setGoals] = useState(initGoals);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');
  const [addGoalForm, setAddGoalForm] = useState({ goal: '', target: '', progress: 0 });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [resume, setResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleApply = () => {
    if (!resume.trim()) { showToast('⚠️ Please enter your resume link.'); return; }
    setJobs(j => j.map(x => x.id === selected.id ? { ...x, applied: true } : x));
    setModal(null); setResume(''); setCoverLetter('');
    showToast(`🎉 Application submitted to ${selected.company}!`);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!addGoalForm.goal || !addGoalForm.target) return;
    setGoals([...goals, { id: Date.now(), ...addGoalForm, progress: parseInt(addGoalForm.progress), status: 'on-track' }]);
    setAddGoalForm({ goal: '', target: '', progress: 0 });
    setShowGoalForm(false);
    showToast('🎯 New career goal added!');
  };

  const updateProgress = (id, val) => {
    setGoals(g => g.map(x => x.id === id ? { ...x, progress: parseInt(val), status: parseInt(val) >= 100 ? 'completed' : x.status } : x));
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, background: '#111827', color: 'white', padding: '12px 20px', borderRadius: 10, zIndex: 2000, fontSize: 14, fontWeight: 600 }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>🚀 Career & TPO Portal</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Placement opportunities, goals, and career development</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Openings', value: jobs.length, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Eligible For', value: jobs.filter(j => j.eligible).length, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Applied', value: jobs.filter(j => j.applied).length, color: '#d97706', bg: '#fffbeb' },
          { label: 'Shortlisted', value: jobs.filter(j => j.shortlisted).length, color: '#dc2626', bg: '#fef2f2' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 12, padding: '20px', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Career Goals */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>🎯 Career Goals Tracker</h2>
          <button onClick={() => setShowGoalForm(!showGoalForm)} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {showGoalForm ? '✕ Cancel' : '+ Add Goal'}
          </button>
        </div>
        {showGoalForm && (
          <form onSubmit={handleAddGoal} style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 180 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Goal</label>
              <input required value={addGoalForm.goal} onChange={e => setAddGoalForm({ ...addGoalForm, goal: e.target.value })} placeholder="e.g. Learn React Native" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Target</label>
              <input required value={addGoalForm.target} onChange={e => setAddGoalForm({ ...addGoalForm, target: e.target.value })} placeholder="e.g. 2026-Jun" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Progress %</label>
              <input type="number" min="0" max="100" value={addGoalForm.progress} onChange={e => setAddGoalForm({ ...addGoalForm, progress: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ background: '#6366f1', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>Add</button>
          </form>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map((g) => (
            <div key={g.id} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{g.goal}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Target: {g.target}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min="0" max="100" value={g.progress} onChange={e => updateProgress(g.id, e.target.value)}
                    style={{ width: 80, cursor: 'pointer' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', minWidth: 35 }}>{g.progress}%</span>
                  <span style={{ background: g.progress >= 100 ? '#f0fdf4' : g.status === 'on-track' ? '#f0fdf4' : '#fef2f2', color: g.progress >= 100 ? '#16a34a' : g.status === 'on-track' ? '#16a34a' : '#dc2626', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                    {g.progress >= 100 ? '✅ Done' : g.status === 'on-track' ? '✅ On Track' : '⚠️ At Risk'}
                  </span>
                </div>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: 100, height: 8 }}>
                <div style={{ width: `${g.progress}%`, height: '100%', background: g.progress >= 100 ? '#16a34a' : g.status === 'on-track' ? '#22c55e' : '#f59e0b', borderRadius: 100, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jobs */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>💼 Active Opportunities</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map((j) => {
            const daysLeft = Math.ceil((new Date(j.deadline) - new Date()) / 86400000);
            return (
              <div key={j.id} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: j.eligible ? 1 : 0.6 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ fontSize: 32 }}>{j.logo}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{j.company}</div>
                    <div style={{ fontSize: 14, color: '#374151' }}>{j.role}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{j.package} · {j.type}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {!j.eligible && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Not Eligible</div>}
                  {j.shortlisted && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>⭐ Shortlisted</div>}
                  <div style={{ fontSize: 12, color: daysLeft <= 3 ? '#dc2626' : '#6b7280', marginBottom: 8, fontWeight: daysLeft <= 3 ? 700 : 400 }}>Deadline: {new Date(j.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({daysLeft}d)</div>
                  {j.eligible && (
                    j.applied ? (
                      <span style={{ background: '#eff6ff', color: '#2563eb', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>📨 Applied</span>
                    ) : (
                      <button onClick={() => { setSelected(j); setModal('apply'); }} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Apply Now →</button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply Modal */}
      {modal === 'apply' && selected && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 500 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#111827' }}>📋 Apply to {selected.company}</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>{selected.role} · {selected.package}</p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Resume / Portfolio Link *</label>
              <input value={resume} onChange={e => setResume(e.target.value)} placeholder="e.g. https://drive.google.com/your-resume.pdf"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Cover Letter (Optional)</label>
              <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={4}
                placeholder="Why are you a good fit for this role?"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: '#374151' }}>
              ✅ By applying, your academic records will be shared with {selected.company} as per placement policy.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleApply} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CareerPortal;
