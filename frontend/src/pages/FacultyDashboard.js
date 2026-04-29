import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const recentActivity = [
  { action: 'Submitted grades for CS201 (Section A)', time: '2 hours ago', icon: '📝' },
  { action: 'Updated attendance for CS301 lecture', time: '5 hours ago', icon: '✅' },
  { action: 'Uploaded assignment: AVL Tree Implementation', time: '1 day ago', icon: '📎' },
  { action: 'Marked 3 students absent in CS401', time: '1 day ago', icon: '⚠️' },
  { action: 'Published mid-semester grades for CS201', time: '3 days ago', icon: '📊' },
];

const pendingTasks = [
  { task: 'Submit CS401 internal marks by May 10', priority: 'high', days: 11 },
  { task: 'Upload CS201 assignment solutions', priority: 'medium', days: 5 },
  { task: 'Review 4 student leave requests', priority: 'low', days: 3 },
  { task: 'Complete CS301 syllabus by May 20', priority: 'medium', days: 21 },
  { task: 'Submit end-semester question paper', priority: 'high', days: 14 },
];

const courseStats = [
  { code: 'CS201', name: 'Data Structures', enrolled: 58, capacity: 60, avgAttendance: 87, avgGrade: 'B+', section: 'A', days: 'Mon,Wed,Fri', time: '9:00–10:00', room: 'LH-301' },
  { code: 'CS301', name: 'DBMS', enrolled: 52, capacity: 55, avgAttendance: 82, avgGrade: 'B', section: 'A', days: 'Tue,Thu', time: '10:30–12:00', room: 'LH-302' },
  { code: 'CS202', name: 'OOP with Java', enrolled: 55, capacity: 60, avgAttendance: 78, avgGrade: 'A-', section: 'B', days: 'Tue,Thu,Sat', time: '8:00–9:00', room: 'LH-201' },
  { code: 'IT301', name: 'Web Technologies', enrolled: 47, capacity: 60, avgAttendance: 91, avgGrade: 'A', section: 'A', days: 'Mon,Wed,Fri', time: '1:00–2:00', room: 'LH-202' },
  { code: 'CS601', name: 'Software Engineering', enrolled: 42, capacity: 55, avgAttendance: 85, avgGrade: 'B+', section: 'A', days: 'Fri', time: '2:00–5:00', room: 'LH-304' },
];

const researchPubs = [
  { title: 'Efficient Graph Algorithms for Distributed Systems', journal: 'IEEE Transactions on Software Engineering', year: 2025, status: 'published', citations: 12 },
  { title: 'Novel Approach to B-Tree Indexing in Modern RDBMS', journal: 'ACM Computing Surveys', year: 2026, status: 'under-review', citations: 0 },
  { title: 'Comparative Analysis of Sorting Algorithms on GPU Architectures', journal: 'Elsevier - Journal of Parallel Computing', year: 2024, status: 'published', citations: 28 },
];

function FacultyDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMyCourses(); }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await api.get('/courses/offerings', { params: { semester: 'Spring', academicYear: 2026 } });
      setCourses(response.data.data.offerings || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalStudents = courseStats.reduce((s, c) => s + c.enrolled, 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>⏳</div>
      <div style={{ color: '#6b7280' }}>Loading dashboard...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)',
        borderRadius: 16, padding: '32px 36px', marginBottom: 24, color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 32px rgba(16,185,129,0.3)'
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>👨‍🏫 Welcome, {user?.first_name} {user?.last_name}!</h1>
          <p style={{ opacity: 0.85, fontSize: 15 }}>Associate Professor · Computer Science & Engineering · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 24px' }}>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{courseStats.length}</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Active Courses</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Courses Teaching', value: courseStats.length, icon: '📚', color: '#10b981' },
          { label: 'Total Students', value: totalStudents, icon: '👥', color: '#6366f1' },
          { label: 'Avg Attendance', value: `${Math.round(courseStats.reduce((s, c) => s + c.avgAttendance, 0) / courseStats.length)}%`, icon: '✅', color: '#d97706' },
          { label: 'Pending Tasks', value: pendingTasks.length, icon: '📋', color: '#dc2626' },
          { label: 'Publications', value: researchPubs.length, icon: '📄', color: '#7c3aed' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderTop: `4px solid ${s.color}`
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Courses (feature-rich) */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>📚 My Courses — Spring 2026</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {courseStats.map((c, i) => {
            const fillPct = Math.round((c.enrolled / c.capacity) * 100);
            const attColor = c.avgAttendance >= 85 ? '#16a34a' : c.avgAttendance >= 75 ? '#d97706' : '#dc2626';
            return (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{c.code} · {c.section}</span>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginTop: 6 }}>{c.name}</div>
                  </div>
                  <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Active</span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>📅 {c.days} · ⏰ {c.time} · 📍 {c.room}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 8, padding: '8px 4px' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{c.enrolled}/{c.capacity}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>Enrolled</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 8, padding: '8px 4px' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: attColor }}>{c.avgAttendance}%</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>Avg Attendance</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 8, padding: '8px 4px' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#6366f1' }}>{c.avgGrade}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>Avg Grade</div>
                  </div>
                </div>
                {/* Enrollment bar */}
                <div style={{ background: '#f3f4f6', borderRadius: 100, height: 6, marginBottom: 12 }}>
                  <div style={{ width: `${fillPct}%`, height: '100%', background: fillPct > 90 ? '#ef4444' : '#10b981', borderRadius: 100 }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link to={`/faculty/grade-entry/${courses[i]?.id || i + 1}`} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>Enter Grades</Link>
                  <Link to="/faculty/attendance" style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>Attendance</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Pending Tasks */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>📋 Pending Tasks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid #f3f4f6', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: t.priority === 'high' ? '#dc2626' : t.priority === 'medium' ? '#f59e0b' : '#6b7280'
                  }} />
                  <span style={{ fontSize: 13, color: '#111827' }}>{t.task}</span>
                </div>
                <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>{t.days}d left</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>🕐 Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', border: '1px solid #f3f4f6', borderRadius: 8 }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.4 }}>{a.action}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Research Publications */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>📄 Research Publications</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {researchPubs.map((p, i) => (
            <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{p.journal} · {p.year}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: p.status === 'published' ? '#f0fdf4' : '#fffbeb', color: p.status === 'published' ? '#16a34a' : '#d97706', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{p.status === 'published' ? '✅ Published' : '⏳ Under Review'}</span>
                {p.citations > 0 && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>📊 {p.citations} citations</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
