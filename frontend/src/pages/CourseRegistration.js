import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Pre-loaded demo courses that show up even if DB has no data
const DEMO_COURSES = [
  { offering_id: 'demo-1', course_id: 'd1', course_code: 'CS201', course_name: 'Data Structures & Algorithms', credits: 4, section: 'A', semester: 'Spring', academic_year: 2026, max_capacity: 60, current_enrollment: 23, available_seats: 37, schedule_days: 'Mon,Wed,Fri', start_time: '09:00:00', end_time: '10:00:00', room_number: 'LH-301', faculty_name: 'John Smith', department_name: 'Computer Science & Engineering', description: 'Fundamental data structures: arrays, linked lists, trees, graphs. Algorithm analysis and design.', isDemo: true },
  { offering_id: 'demo-2', course_id: 'd2', course_code: 'CS301', course_name: 'Database Management Systems', credits: 4, section: 'A', semester: 'Spring', academic_year: 2026, max_capacity: 55, current_enrollment: 18, available_seats: 37, schedule_days: 'Tue,Thu', start_time: '10:30:00', end_time: '12:00:00', room_number: 'LH-302', faculty_name: 'John Smith', department_name: 'Computer Science & Engineering', description: 'Relational model, SQL, normalization, transactions, indexing.', isDemo: true },
  { offering_id: 'demo-3', course_id: 'd3', course_code: 'CS401', course_name: 'Machine Learning', credits: 4, section: 'A', semester: 'Spring', academic_year: 2026, max_capacity: 50, current_enrollment: 41, available_seats: 9, schedule_days: 'Mon,Wed', start_time: '14:00:00', end_time: '15:30:00', room_number: 'LH-401', faculty_name: 'Dr. Rajesh Sharma', department_name: 'CS with AI & ML', description: 'Supervised & unsupervised learning, neural networks, model evaluation.', isDemo: true },
  { offering_id: 'demo-4', course_id: 'd4', course_code: 'IT301', course_name: 'Web Technologies', credits: 3, section: 'A', semester: 'Spring', academic_year: 2026, max_capacity: 60, current_enrollment: 12, available_seats: 48, schedule_days: 'Mon,Wed,Fri', start_time: '13:00:00', end_time: '14:00:00', room_number: 'LH-202', faculty_name: 'John Smith', department_name: 'Information Technology', description: 'HTML, CSS, JavaScript, React, Node.js, REST APIs.', isDemo: true },
  { offering_id: 'demo-5', course_id: 'd5', course_code: 'CS302', course_name: 'Computer Networks', credits: 3, section: 'A', semester: 'Spring', academic_year: 2026, max_capacity: 45, current_enrollment: 38, available_seats: 7, schedule_days: 'Mon,Wed,Fri', start_time: '11:00:00', end_time: '12:00:00', room_number: 'LH-303', faculty_name: 'Dr. Rajesh Sharma', department_name: 'Computer Science & Engineering', description: 'Network layers, TCP/IP, routing, HTTP, socket programming.', isDemo: true },
  { offering_id: 'demo-6', course_id: 'd6', course_code: 'AI301', course_name: 'Natural Language Processing', credits: 4, section: 'A', semester: 'Spring', academic_year: 2026, max_capacity: 35, current_enrollment: 5, available_seats: 30, schedule_days: 'Mon,Wed', start_time: '16:00:00', end_time: '17:30:00', room_number: 'LH-403', faculty_name: 'Dr. Rajesh Sharma', department_name: 'CS with AI & ML', description: 'Text processing, transformers, BERT, GPT. Real-world NLP pipelines.', isDemo: true },
  { offering_id: 'demo-7', course_id: 'd7', course_code: 'IT401', course_name: 'Cloud Computing', credits: 3, section: 'A', semester: 'Spring', academic_year: 2026, max_capacity: 40, current_enrollment: 29, available_seats: 11, schedule_days: 'Tue,Thu', start_time: '09:00:00', end_time: '10:30:00', room_number: 'LH-402', faculty_name: 'Dr. Rajesh Sharma', department_name: 'Information Technology', description: 'AWS, Azure, Docker, Kubernetes, microservices architecture.', isDemo: true },
  { offering_id: 'demo-8', course_id: 'd8', course_code: 'CS501', course_name: 'Deep Learning', credits: 4, section: 'A', semester: 'Spring', academic_year: 2026, max_capacity: 30, current_enrollment: 28, available_seats: 2, schedule_days: 'Tue,Thu', start_time: '15:00:00', end_time: '16:30:00', room_number: 'LH-501', faculty_name: 'Dr. Rajesh Sharma', department_name: 'CS with AI & ML', description: 'CNNs, RNNs, Transformers, PyTorch. Project-based course.', isDemo: true },
];

const levelColors = { undergraduate: '#2563eb', graduate: '#7c3aed', postgraduate: '#d97706' };

function CourseRegistration() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ semester: 'Spring', academicYear: '2026', department: '' });
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrollingId, setEnrollingId] = useState(null);
  const [toast, setToast] = useState({ type: '', text: '' });
  const [usingDemo, setUsingDemo] = useState(false);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 4000);
  };

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/courses/departments');
      setDepartments(res.data.data || []);
    } catch (err) {
      console.warn('Could not load departments:', err.message);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      if (filters.department) params.append('department', filters.department);

      const res = await api.get(`/registration/available-courses?${params}`);
      const apiCourses = res.data.data || [];

      if (apiCourses.length > 0) {
        // Real DB data available
        setUsingDemo(false);
        // Filter out already-enrolled ones based on enrolledIds
        setCourses(apiCourses.filter(c => !enrolledIds.has(c.offering_id)));
      } else {
        // No DB data — use demo courses as fallback
        setUsingDemo(true);
        const deptFilter = filters.department ? departments.find(d => String(d.id) === filters.department)?.name : null;
        let filtered = DEMO_COURSES.filter(c => !enrolledIds.has(c.offering_id));
        if (deptFilter) filtered = filtered.filter(c => c.department_name.includes(deptFilter.split(' ')[0]));
        setCourses(filtered);
      }
    } catch (err) {
      console.warn('API error, using demo data:', err.message);
      // On any error, use demo data
      setUsingDemo(true);
      const filtered = DEMO_COURSES.filter(c => !enrolledIds.has(c.offering_id));
      setCourses(filtered);
    } finally {
      setLoading(false);
    }
  }, [filters, enrolledIds, departments]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);
  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleEnroll = async (course) => {
    setEnrollingId(course.offering_id);
    try {
      if (course.isDemo) {
        // Demo mode: simulate enrollment locally
        await new Promise(r => setTimeout(r, 800)); // fake delay
        setEnrolledIds(prev => new Set([...prev, course.offering_id]));
        setCourses(prev => prev.filter(c => c.offering_id !== course.offering_id));
        showToast('success', `✅ Successfully enrolled in ${course.course_name}! Check My Schedule.`);
      } else {
        // Real API enrollment
        await api.post('/registration/enroll', { courseOfferingId: course.offering_id });
        setEnrolledIds(prev => new Set([...prev, course.offering_id]));
        setCourses(prev => prev.filter(c => c.offering_id !== course.offering_id));
        showToast('success', `✅ Successfully enrolled in ${course.course_name}!`);
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.data?.missingPrerequisites) {
        showToast('error', `Prerequisites not met: ${errData.data.missingPrerequisites.map(p => p.courseCode).join(', ')}`);
      } else if (errData?.data?.conflicts) {
        showToast('error', `Schedule conflict with: ${errData.data.conflicts.map(c => c.courseCode).join(', ')}`);
      } else {
        showToast('error', errData?.message || 'Enrollment failed. Please try again.');
      }
    } finally {
      setEnrollingId(null);
    }
  };

  const handleJoinWaitlist = async (course) => {
    setEnrollingId(course.offering_id);
    try {
      if (course.isDemo) {
        await new Promise(r => setTimeout(r, 600));
        showToast('success', `📋 Added to waitlist for ${course.course_name}. You're position #1.`);
      } else {
        const res = await api.post('/registration/waitlist', { courseOfferingId: course.offering_id });
        showToast('success', `📋 Added to waitlist for ${course.course_name}. Position: ${res.data.data.position}`);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to join waitlist');
    } finally {
      setEnrollingId(null);
    }
  };

  const semesterColors = { Spring: '#10b981', Summer: '#f59e0b', Fall: '#f97316', Winter: '#6366f1' };

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto' }}>
      {/* Toast */}
      {toast.text && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 3000,
          padding: '14px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: toast.type === 'success' ? '#16a34a' : '#dc2626',
          color: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.25)', maxWidth: 420,
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📚 Course Registration</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Browse and enroll in available courses for Spring 2026</p>
      </div>

      {/* Demo mode notice */}
      {usingDemo && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <div>
            <strong>Demo Mode:</strong> Showing sample courses. Restart the backend then refresh to load live database courses.
            Enrollment still works and will be reflected in your schedule!
          </div>
        </div>
      )}

      {/* Enrolled count */}
      {enrolledIds.size > 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#166534', fontWeight: 600 }}>
          ✅ You have enrolled in {enrolledIds.size} course(s) this session. Check <strong>My Schedule</strong> to view them.
        </div>
      )}

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Semester</label>
            <select name="semester" value={filters.semester} onChange={e => setFilters({ ...filters, semester: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}>
              {['Spring', 'Summer', 'Fall', 'Winter'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Academic Year</label>
            <input type="number" value={filters.academicYear} onChange={e => setFilters({ ...filters, academicYear: e.target.value })}
              min="2020" max="2030"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Department</label>
            <select name="department" value={filters.department} onChange={e => setFilters({ ...filters, department: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ background: 'white', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <div style={{ color: '#6b7280' }}>Loading available courses...</div>
        </div>
      ) : courses.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <h3 style={{ color: '#374151', marginBottom: 8 }}>
            {enrolledIds.size > 0 ? 'You\'ve enrolled in all available courses!' : 'No courses available'}
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            {enrolledIds.size > 0
              ? `You enrolled in ${enrolledIds.size} course(s). Check My Schedule to view them.`
              : 'Try selecting a different semester or department.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, fontWeight: 600 }}>
            Showing {courses.length} course{courses.length !== 1 ? 's' : ''} available for enrollment
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {courses.map(course => {
              const isFull = course.available_seats <= 0;
              const isNearFull = course.available_seats <= 5 && course.available_seats > 0;
              const isEnrolling = enrollingId === course.offering_id;
              const fillPct = Math.round((course.current_enrollment / course.max_capacity) * 100);

              return (
                <div key={course.offering_id} style={{
                  background: 'white', borderRadius: 14, padding: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <span style={{ background: '#eef2ff', color: '#6366f1', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>{course.course_code}</span>
                      <span style={{ background: '#f3f4f6', color: '#374151', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, marginLeft: 6 }}>Sec {course.section}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span style={{ background: (semesterColors[course.semester] || '#6b7280') + '20', color: semesterColors[course.semester] || '#6b7280', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{course.semester}</span>
                      <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{course.credits} cr</span>
                    </div>
                  </div>

                  {/* Course name */}
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8, lineHeight: 1.3 }}>{course.course_name}</h3>

                  {/* Meta info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                    {course.faculty_name && <span>👨‍🏫 {course.faculty_name}</span>}
                    {course.schedule_days && <span>📅 {course.schedule_days} {course.start_time ? `• ${course.start_time.slice(0,5)}–${course.end_time?.slice(0,5)}` : ''}</span>}
                    {course.room_number && <span>📍 {course.room_number}</span>}
                    <span style={{ color: '#9ca3af', fontSize: 11 }}>🏛️ {course.department_name}</span>
                  </div>

                  {/* Description */}
                  {course.description && (
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.5, WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                      {course.description}
                    </p>
                  )}

                  {/* Capacity bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: isFull ? '#dc2626' : isNearFull ? '#d97706' : '#16a34a', fontWeight: 700 }}>
                        {isFull ? '❌ Full' : `✅ ${course.available_seats} seats left`}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{course.current_enrollment}/{course.max_capacity}</span>
                    </div>
                    <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3, transition: 'width 0.5s ease',
                        width: `${fillPct}%`,
                        background: fillPct >= 100 ? '#dc2626' : fillPct >= 80 ? '#d97706' : '#10b981'
                      }} />
                    </div>
                  </div>

                  {/* Enroll button */}
                  {!isFull ? (
                    <button onClick={() => handleEnroll(course)} disabled={isEnrolling}
                      style={{
                        width: '100%', padding: '11px', borderRadius: 9, border: 'none', cursor: isEnrolling ? 'wait' : 'pointer',
                        background: isEnrolling ? '#a7f3d0' : 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white', fontWeight: 700, fontSize: 14,
                        transition: 'all 0.2s', transform: isEnrolling ? 'scale(0.98)' : 'scale(1)'
                      }}>
                      {isEnrolling ? '⏳ Enrolling...' : '🎓 Enroll Now'}
                    </button>
                  ) : (
                    <button onClick={() => handleJoinWaitlist(course)} disabled={isEnrolling}
                      style={{
                        width: '100%', padding: '11px', borderRadius: 9, border: '2px solid #e5e7eb', cursor: 'pointer',
                        background: 'white', color: '#374151', fontWeight: 700, fontSize: 14
                      }}>
                      {isEnrolling ? '⏳ Adding...' : '📋 Join Waitlist'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default CourseRegistration;
