import React, { useState, useEffect } from 'react';
import api from '../services/api';

const statusConfig = {
  enrolled:  { bg: '#eff6ff', text: '#2563eb',  label: '📚 Enrolled' },
  completed: { bg: '#f0fdf4', text: '#16a34a',  label: '✅ Completed' },
  dropped:   { bg: '#fef2f2', text: '#dc2626',  label: '❌ Dropped' },
};

function MySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: '', text: '' });
  const [dropping, setDropping] = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast({ type: '', text: '' }), 3500); };

  useEffect(() => { fetchSchedule(); }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get('/registration/my-schedule');
      // Show ALL: enrolled + completed so students see their full history
      setSchedule(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      showToast('error', 'Failed to load schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (enrollmentId, courseName) => {
    setDropping(enrollmentId);
    try {
      await api.delete(`/registration/drop/${enrollmentId}`);
      showToast('success', `✅ Successfully dropped ${courseName}`);
      fetchSchedule();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to drop course');
    } finally {
      setDropping(null);
    }
  };

  const enrolled  = schedule.filter(c => c.status === 'enrolled');
  const completed = schedule.filter(c => c.status === 'completed');
  const totalEnrolledCredits = enrolled.reduce((s, c) => s + (c.credits || 0), 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>⏳</div><div style={{ color: '#6b7280' }}>Loading your schedule...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {toast.text && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: toast.type === 'success' ? '#16a34a' : '#dc2626', color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast.text}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📅 My Schedule</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Your enrolled courses and academic history</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Currently Enrolled', val: enrolled.length, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Completed Courses', val: completed.length, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Current Credit Load', val: `${totalEnrolledCredits} cr.`, color: '#7c3aed', bg: '#f5f3ff' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 12, padding: '20px', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {schedule.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <h3 style={{ color: '#374151', marginBottom: 8 }}>No courses enrolled</h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Go to Course Registration to enroll in courses for Spring 2026.</p>
        </div>
      ) : (
        <>
          {/* Currently Enrolled */}
          {enrolled.length > 0 && (
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>📚 Currently Enrolled — Spring 2026</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {enrolled.map(course => (
                  <div key={course.enrollment_id} style={{ border: '1px solid #e0e7ff', borderRadius: 10, padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                          <span style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>{course.course_code}</span>
                          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>Sec {course.section}</span>
                          <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{course.credits} Credits</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{course.course_name}</div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
                          {course.schedule_days && <span>📅 {course.schedule_days}</span>}
                          {course.start_time && <span>⏰ {course.start_time} – {course.end_time}</span>}
                          {course.room_number && <span>📍 {course.room_number}</span>}
                          {course.faculty_name && <span>👨‍🏫 {course.faculty_name}</span>}
                        </div>
                      </div>
                      <div style={{ marginLeft: 16, textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{course.semester} {course.academic_year}</div>
                        <button onClick={() => handleDrop(course.enrollment_id, course.course_name)} disabled={dropping === course.enrollment_id}
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          {dropping === course.enrollment_id ? '⏳ Dropping...' : '❌ Drop Course'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Courses */}
          {completed.length > 0 && (
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>✅ Completed Courses</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {completed.map(course => (
                  <div key={course.enrollment_id} style={{ border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 20px', borderLeft: '4px solid #16a34a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                        <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>{course.course_code}</span>
                        <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{course.credits} Credits</span>
                        <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>✅ Completed</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{course.course_name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{course.semester} {course.academic_year} · {course.faculty_name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {course.is_grade_published && course.grade ? (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{course.grade}</div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>Grade</div>
                        </div>
                      ) : (
                        <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '6px 12px', borderRadius: 6, fontSize: 12 }}>Grade Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MySchedule;
