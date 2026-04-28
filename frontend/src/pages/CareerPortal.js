import React from 'react';

const jobs = [
  { company: 'Google', role: 'SDE Intern', package: '80,000/month', deadline: '2026-05-10', type: 'Internship', eligible: true, logo: '🔵' },
  { company: 'Microsoft', role: 'Software Engineer', package: '18 LPA', deadline: '2026-05-15', type: 'Full-time', eligible: true, logo: '🟦' },
  { company: 'Infosys', role: 'Systems Engineer', package: '4.5 LPA', deadline: '2026-05-05', type: 'Full-time', eligible: true, logo: '🔷' },
  { company: 'NVIDIA', role: 'Deep Learning Intern', package: '1,20,000/month', deadline: '2026-05-20', type: 'Internship', eligible: false, logo: '🟢' },
  { company: 'Flipkart', role: 'Backend Engineer', package: '14 LPA', deadline: '2026-05-25', type: 'Full-time', eligible: true, logo: '🟡' },
];

const goals = [
  { goal: 'Achieve 9.0+ CGPA', progress: 75, target: '2026-May', status: 'on-track' },
  { goal: 'Complete AWS Cloud Practitioner', progress: 40, target: '2026-Apr', status: 'at-risk' },
  { goal: 'Build 3 GitHub Projects', progress: 67, target: '2026-Jun', status: 'on-track' },
  { goal: 'Crack Google SDE Interview', progress: 20, target: '2026-Dec', status: 'on-track' },
];

function CareerPortal() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>🚀 Career & TPO Portal</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Placement opportunities, goals, and career development</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Openings', value: jobs.length, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Eligible For', value: jobs.filter(j => j.eligible).length, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Applied', value: 2, color: '#d97706', bg: '#fffbeb' },
          { label: 'Shortlisted', value: 1, color: '#dc2626', bg: '#fef2f2' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 12, padding: '20px', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Career Goals */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>🎯 Career Goals Tracker</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map((g, i) => (
            <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{g.goal}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Target: {g.target}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{g.progress}%</span>
                  <span style={{ background: g.status === 'on-track' ? '#f0fdf4' : '#fef2f2', color: g.status === 'on-track' ? '#16a34a' : '#dc2626', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                    {g.status === 'on-track' ? '✅ On Track' : '⚠️ At Risk'}
                  </span>
                </div>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: 100, height: 8 }}>
                <div style={{ width: `${g.progress}%`, height: '100%', background: g.status === 'on-track' ? '#22c55e' : '#f59e0b', borderRadius: 100 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jobs */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>💼 Active Opportunities</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map((j, i) => {
            const daysLeft = Math.ceil((new Date(j.deadline) - new Date()) / 86400000);
            return (
              <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: j.eligible ? 1 : 0.6 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ fontSize: 32 }}>{j.logo}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{j.company}</div>
                    <div style={{ fontSize: 14, color: '#374151' }}>{j.role}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>💰 {j.package} · {j.type}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {!j.eligible && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Not Eligible</div>}
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Deadline: {new Date(j.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({daysLeft}d)</div>
                  {j.eligible && <button style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Apply Now</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CareerPortal;
