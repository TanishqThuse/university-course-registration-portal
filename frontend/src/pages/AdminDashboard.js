import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const stats = [
  { label: 'Total Students', value: '2,847', change: '+124', icon: '👨‍🎓', color: '#6366f1', bg: '#eef2ff' },
  { label: 'Faculty Members', value: '186', change: '+8', icon: '👨‍🏫', color: '#10b981', bg: '#ecfdf5' },
  { label: 'Active Courses', value: '342', change: '+45', icon: '📚', color: '#d97706', bg: '#fffbeb' },
  { label: 'Enrollments', value: '8,421', change: '+1,205', icon: '📝', color: '#dc2626', bg: '#fef2f2' },
  { label: 'Departments', value: '12', change: '—', icon: '🏛️', color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Revenue (₹)', value: '4.2Cr', change: '+18%', icon: '💰', color: '#059669', bg: '#ecfdf5' },
];

const deptPerformance = [
  { dept: 'Computer Science', students: 485, faculty: 32, courses: 58, avgGPA: 3.45, passRate: 94 },
  { dept: 'Information Technology', students: 320, faculty: 24, courses: 42, avgGPA: 3.28, passRate: 91 },
  { dept: 'AI & ML', students: 280, faculty: 22, courses: 38, avgGPA: 3.52, passRate: 96 },
  { dept: 'Electronics & Telecom', students: 250, faculty: 20, courses: 35, avgGPA: 3.15, passRate: 88 },
  { dept: 'Mechanical', students: 310, faculty: 28, courses: 45, avgGPA: 3.08, passRate: 85 },
  { dept: 'Civil', students: 200, faculty: 18, courses: 30, avgGPA: 3.22, passRate: 90 },
];

const recentEvents = [
  { event: 'New student registration: Priya Verma (IT)', time: '10 min ago', type: 'registration' },
  { event: 'Course CS401 reached full capacity (50/50)', time: '25 min ago', type: 'warning' },
  { event: 'Dr. Sharma submitted grades for CS201-A', time: '1 hour ago', type: 'grade' },
  { event: 'Faculty leave approved: Prof. Mehra (May 5-7)', time: '2 hours ago', type: 'leave' },
  { event: 'System backup completed successfully', time: '4 hours ago', type: 'system' },
  { event: 'Fee payment received: ₹95,000 (STU2023001)', time: '5 hours ago', type: 'payment' },
  { event: 'Grievance #GRV-2026-088 requires attention', time: '6 hours ago', type: 'alert' },
];

const quickActions = [
  { label: 'Create Course', icon: '➕', to: '/admin/courses', color: '#6366f1' },
  { label: 'View Reports', icon: '📊', to: '/admin/reports', color: '#10b981' },
  { label: 'Manage Users', icon: '👥', to: '/admin/users', color: '#d97706' },
  { label: 'Fee Management', icon: '💳', to: '/admin/fees', color: '#dc2626' },
  { label: 'Grievances', icon: '📣', to: '/admin/grievances', color: '#7c3aed' },
  { label: 'Announcements', icon: '📢', to: '/admin/announcements', color: '#0891b2' },
  { label: 'Exam Schedule', icon: '📋', to: '/admin/exams', color: '#db2777' },
  { label: 'System Logs', icon: '📝', to: '/admin/logs', color: '#374151' },
];

const typeIcons = { registration: '👤', warning: '⚠️', grade: '📝', leave: '🏖️', system: '⚙️', payment: '💰', alert: '🔔' };

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #a855f7 100%)',
        borderRadius: 16, padding: '32px 36px', marginBottom: 24, color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 32px rgba(124,58,237,0.3)'
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🛡️ Administrator Dashboard</h1>
          <p style={{ opacity: 0.85, fontSize: 15 }}>Welcome back, {user?.first_name}! · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>99.8%</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Uptime</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Spring '26</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Current Sem</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.change.startsWith('+') ? '#16a34a' : '#6b7280', marginTop: 4, fontWeight: 600 }}>{s.change} this sem</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Quick Actions */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {quickActions.map((qa, i) => (
              <Link key={i} to={qa.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: `${qa.color}10`, borderRadius: 10, padding: '16px 10px', textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', border: `1px solid ${qa.color}20`
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{qa.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: qa.color }}>{qa.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Feed */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>🔴 Live Activity Feed</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
            {recentEvents.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', border: '1px solid #f3f4f6', borderRadius: 8, fontSize: 13 }}>
                <span style={{ fontSize: 16 }}>{typeIcons[e.type]}</span>
                <div>
                  <div style={{ color: '#111827', lineHeight: 1.4 }}>{e.event}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{e.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>🏛️ Department Performance Overview</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Department', 'Students', 'Faculty', 'Courses', 'Avg GPA', 'Pass Rate'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deptPerformance.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 12px', fontWeight: 600, color: '#111827' }}>{d.dept}</td>
                <td style={{ padding: '14px 12px' }}>{d.students}</td>
                <td style={{ padding: '14px 12px' }}>{d.faculty}</td>
                <td style={{ padding: '14px 12px' }}>{d.courses}</td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ fontWeight: 700, color: d.avgGPA >= 3.3 ? '#16a34a' : d.avgGPA >= 3.0 ? '#d97706' : '#dc2626' }}>{d.avgGPA.toFixed(2)}</span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ background: '#f3f4f6', borderRadius: 100, height: 6, flex: 1, maxWidth: 80 }}>
                      <div style={{ width: `${d.passRate}%`, height: '100%', background: d.passRate >= 90 ? '#22c55e' : '#f59e0b', borderRadius: 100 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{d.passRate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enrollment Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>📈 Enrollment Trend (Last 6 Semesters)</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
            {[
              { sem: 'Fall 23', val: 2100, pct: 60 },
              { sem: 'Spr 24', val: 2350, pct: 67 },
              { sem: 'Fall 24', val: 2480, pct: 71 },
              { sem: 'Spr 25', val: 2600, pct: 74 },
              { sem: 'Fall 25', val: 2720, pct: 78 },
              { sem: 'Spr 26', val: 2847, pct: 81 },
            ].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{d.val}</div>
                <div style={{
                  height: `${d.pct * 1.8}px`, background: `linear-gradient(180deg, #7c3aed, #a855f7)`,
                  borderRadius: '6px 6px 0 0', margin: '0 auto', width: '70%',
                  transition: 'height 0.5s ease'
                }} />
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 6 }}>{d.sem}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>📊 Revenue Overview</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
            {[
              { sem: 'Fall 23', val: '2.8Cr', pct: 56 },
              { sem: 'Spr 24', val: '3.1Cr', pct: 62 },
              { sem: 'Fall 24', val: '3.4Cr', pct: 68 },
              { sem: 'Spr 25', val: '3.6Cr', pct: 72 },
              { sem: 'Fall 25', val: '3.9Cr', pct: 78 },
              { sem: 'Spr 26', val: '4.2Cr', pct: 84 },
            ].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{d.val}</div>
                <div style={{
                  height: `${d.pct * 1.8}px`, background: `linear-gradient(180deg, #059669, #34d399)`,
                  borderRadius: '6px 6px 0 0', margin: '0 auto', width: '70%'
                }} />
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 6 }}>{d.sem}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
