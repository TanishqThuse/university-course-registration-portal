import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, scheduleRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/registration/my-schedule')
      ]);
      setProfile(profileRes.data.data);
      setSchedule((scheduleRes.data.data || []).filter(c => c.status === 'enrolled'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { to: '/student/register-courses', icon: '📚', label: 'Join Course', color: '#6366f1', bg: '#eef2ff' },
    { to: '/student/attendance', icon: '✅', label: 'Attendance', color: '#16a34a', bg: '#f0fdf4' },
    { to: '/student/timetable', icon: '🕐', label: 'Timetable', color: '#d97706', bg: '#fffbeb' },
    { to: '/student/assignments', icon: '📝', label: 'Assignments', color: '#dc2626', bg: '#fef2f2' },
    { to: '/student/exams', icon: '📋', label: 'Exams', color: '#7c3aed', bg: '#f5f3ff' },
    { to: '/student/fees', icon: '💳', label: 'Fees', color: '#0891b2', bg: '#ecfeff' },
    { to: '/student/events', icon: '🎉', label: 'Events', color: '#db2777', bg: '#fdf2f8' },
    { to: '/student/career', icon: '🚀', label: 'Career', color: '#059669', bg: '#ecfdf5' },
  ];

  const announcements = [
    { id: 1, title: 'End Semester Exam Schedule Released', date: '28 Apr 2026', type: 'exam', urgent: true },
    { id: 2, title: 'Spring 2026 Course Registration Open Until May 15', date: '25 Apr 2026', type: 'registration', urgent: false },
    { id: 3, title: 'Annual Tech Fest "Innovex 2026" — Register Now', date: '20 Apr 2026', type: 'event', urgent: false },
    { id: 4, title: 'Last date to submit Leave Application: May 5', date: '18 Apr 2026', type: 'admin', urgent: true },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>⏳</div>
      <div style={{ color: '#6b7280', fontSize: 16 }}>Loading your dashboard...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #2563eb 100%)',
        borderRadius: 16, padding: '32px 36px', marginBottom: 24, color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 32px rgba(99,102,241,0.3)'
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            👋 Welcome back, {user?.first_name}!
          </h1>
          <p style={{ opacity: 0.85, fontSize: 15 }}>
            {profile?.department_name || 'Computer Science & Engineering'} · Semester {profile?.current_semester || 5} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 24px' }}>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{parseFloat(profile?.cumulative_gpa || 0).toFixed(2)}</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Cumulative GPA</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Enrolled Courses', value: schedule.length || 3, icon: '📚', color: '#6366f1' },
          { label: 'Credits Completed', value: parseFloat(profile?.total_credits_completed || 0), icon: '🎓', color: '#16a34a' },
          { label: 'Current Semester', value: `Sem ${profile?.current_semester || 5}`, icon: '📅', color: '#d97706' },
          { label: 'Academic Standing', value: profile?.academic_standing || 'Good Standing', icon: '⭐', color: '#dc2626', small: true },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderTop: `4px solid ${s.color}`
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: s.small ? 16 : 28, fontWeight: 700, color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Quick Access */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#111827' }}>⚡ Quick Access</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {quickLinks.map((ql, i) => (
              <Link key={i} to={ql.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: ql.bg, borderRadius: 10, padding: '16px 8px', textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{ql.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ql.color }}>{ql.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111827' }}>📢 Announcements</h2>
          {announcements.map(a => (
            <div key={a.id} style={{
              padding: '10px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 10, alignItems: 'flex-start'
            }}>
              {a.urgent && <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0, marginTop: 2 }}>URGENT</span>}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Enrollments */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>📚 My Current Courses</h2>
          <Link to="/student/register-courses" style={{
            background: '#6366f1', color: 'white', padding: '8px 16px', borderRadius: 8,
            textDecoration: 'none', fontSize: 13, fontWeight: 600
          }}>+ Join More Courses</Link>
        </div>
        {schedule.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <h3 style={{ marginBottom: 8, color: '#374151' }}>No courses yet</h3>
            <p style={{ marginBottom: 16 }}>Browse the course marketplace to join your first course</p>
            <Link to="/student/register-courses" style={{
              background: '#6366f1', color: 'white', padding: '10px 24px',
              borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14
            }}>Browse Courses</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Course', 'Code', 'Credits', 'Schedule', 'Room', 'Faculty', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((c, i) => (
                  <tr key={c.enrollment_id || i} style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px', fontWeight: 600, color: '#111827', fontSize: 14 }}>{c.course_name}</td>
                    <td style={{ padding: '12px' }}><span style={{ background: '#eef2ff', color: '#6366f1', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{c.course_code}</span></td>
                    <td style={{ padding: '12px', color: '#374151' }}>{c.credits} cr.</td>
                    <td style={{ padding: '12px', color: '#374151', fontSize: 13 }}>{c.schedule_days && c.start_time ? `${c.schedule_days} ${c.start_time}–${c.end_time}` : 'TBA'}</td>
                    <td style={{ padding: '12px', color: '#374151', fontSize: 13 }}>{c.room_number || 'TBA'}</td>
                    <td style={{ padding: '12px', color: '#374151', fontSize: 13 }}>{c.faculty_name || 'TBA'}</td>
                    <td style={{ padding: '12px' }}><span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>Enrolled</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
