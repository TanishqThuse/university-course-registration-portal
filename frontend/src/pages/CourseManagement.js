import React, { useState, useEffect } from 'react';
import api from '../services/api';

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginTop: 5 };
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block' };

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'offering'
  const [editCourse, setEditCourse] = useState(null);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ course_code: '', course_name: '', credits: 3, course_level: 'undergraduate', department_id: '', description: '' });
  const [offeringForm, setOfferingForm] = useState({ courseId: '', facultyId: '', semester: 'Spring', academicYear: 2026, section: 'A', maxCapacity: 60, roomNumber: '', scheduleDays: 'Mon,Wed,Fri', startTime: '09:00', endTime: '10:00' });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [coursesRes, deptsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/courses/departments'),
      ]);
      setCourses(coursesRes.data.data.courses || []);
      setDepartments(deptsRes.data.data || []);
    } catch (err) {
      console.error(err);
      // Fallback demo data
      setCourses([
        { id: 1, course_code: 'CS201', course_name: 'Data Structures & Algorithms', credits: 4, course_level: 'undergraduate', department_name: 'Computer Science & Engineering', is_active: true },
        { id: 2, course_code: 'CS301', course_name: 'Database Management Systems', credits: 4, course_level: 'undergraduate', department_name: 'Computer Science & Engineering', is_active: true },
        { id: 3, course_code: 'CS401', course_name: 'Machine Learning', credits: 4, course_level: 'undergraduate', department_name: 'CS with AI & ML', is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ course_code: '', course_name: '', credits: 3, course_level: 'undergraduate', department_id: departments[0]?.id || '', description: '' });
    setEditCourse(null);
    setModal('add');
  };

  const openEdit = (c) => {
    setForm({ course_code: c.course_code, course_name: c.course_name, credits: c.credits, course_level: c.course_level || 'undergraduate', department_id: c.department_id || departments[0]?.id || '', description: c.description || '' });
    setEditCourse(c);
    setModal('edit');
  };

  const openOffering = (c) => {
    setOfferingForm({ courseId: c.id, facultyId: '', semester: 'Spring', academicYear: 2026, section: 'A', maxCapacity: 60, roomNumber: '', scheduleDays: 'Mon,Wed,Fri', startTime: '09:00', endTime: '10:00' });
    setModal('offering');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editCourse) {
        await api.put(`/courses/${editCourse.id}`, {
          courseCode: form.course_code, courseName: form.course_name,
          departmentId: parseInt(form.department_id), credits: parseInt(form.credits),
          description: form.description, courseLevel: form.course_level, isActive: true
        });
        showToast(`✅ Course "${form.course_name}" updated!`);
      } else {
        // Step 1: Create the course
        const courseRes = await api.post('/courses', {
          courseCode: form.course_code, courseName: form.course_name,
          departmentId: parseInt(form.department_id), credits: parseInt(form.credits),
          description: form.description, courseLevel: form.course_level
        });

        const newCourseId = courseRes.data.data?.id;

        // Step 2: Auto-create a Spring 2026 offering so students can enroll immediately
        if (newCourseId) {
          try {
            await api.post('/courses/offerings', {
              courseId: newCourseId,
              facultyId: null,
              semester: 'Spring',
              academicYear: 2026,
              section: 'A',
              maxCapacity: 60,
              roomNumber: 'TBD',
              scheduleDays: 'Mon,Wed,Fri',
              startTime: null,
              endTime: null,
            });
            showToast(`✅ Course "${form.course_name}" created! It's now live — students can enroll immediately.`);
          } catch (offerErr) {
            // Offering may already exist (duplicate), still show success
            showToast(`✅ Course "${form.course_name}" created! Click "Add Offering" to schedule it.`);
          }
        } else {
          showToast(`✅ Course "${form.course_name}" created! Click "Add Offering" to make it enrollable.`);
        }
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      showToast(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreateOffering = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses/offerings', {
        courseId: parseInt(offeringForm.courseId),
        facultyId: offeringForm.facultyId ? parseInt(offeringForm.facultyId) : null,
        semester: offeringForm.semester,
        academicYear: parseInt(offeringForm.academicYear),
        section: offeringForm.section,
        maxCapacity: parseInt(offeringForm.maxCapacity),
        roomNumber: offeringForm.roomNumber,
        scheduleDays: offeringForm.scheduleDays,
        startTime: offeringForm.startTime || null,
        endTime: offeringForm.endTime || null,
      });
      showToast('✅ Course offering created! Students can now enroll in this course.');
      setModal(null);
      fetchAll();
    } catch (err) {
      showToast(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const toggleActive = async (c) => {
    try {
      await api.put(`/courses/${c.id}`, {
        courseCode: c.course_code, courseName: c.course_name,
        departmentId: c.department_id, credits: c.credits,
        description: c.description, courseLevel: c.course_level || 'undergraduate',
        isActive: !c.is_active
      });
      showToast(`✅ Course ${!c.is_active ? 'activated' : 'deactivated'}!`);
      fetchAll();
    } catch (err) {
      showToast(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const filtered = courses.filter(c =>
    (c.course_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.course_code || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>⏳</div><div style={{ color: '#6b7280' }}>Loading courses...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, background: '#111827', color: 'white', padding: '12px 20px', borderRadius: 10, zIndex: 2000, fontSize: 14, fontWeight: 600, maxWidth: 420 }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>📚 Course Management</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Create courses and add offerings so students can enroll</p>
      </div>

      {/* Key explanation */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1e40af' }}>
        <strong>📋 Workflow:</strong> Click <strong>"+ Create Course"</strong> → fill in details → course is instantly added to <strong>Spring 2026</strong> and students can enroll right away. Use <strong>"➕ Add Offering"</strong> to add more sections or a different semester.
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Courses', count: courses.length, color: '#6366f1' },
          { label: 'Active', count: courses.filter(c => c.is_active !== false).length, color: '#16a34a' },
          { label: 'Inactive', count: courses.filter(c => c.is_active === false).length, color: '#dc2626' },
          { label: 'Departments', count: [...new Set(courses.map(c => c.department_name).filter(Boolean))].length, color: '#d97706' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search courses..."
            style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, width: 280 }} />
          <button onClick={openAdd} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ Create Course</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Code', 'Course Name', 'Department', 'Credits', 'Level', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px' }}><span style={{ background: '#eef2ff', color: '#6366f1', padding: '3px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>{c.course_code}</span></td>
                <td style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>{c.course_name}</td>
                <td style={{ padding: '12px', color: '#6b7280', fontSize: 13 }}>{c.department_name || '—'}</td>
                <td style={{ padding: '12px', color: '#374151' }}>{c.credits} cr.</td>
                <td style={{ padding: '12px' }}><span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 5, fontSize: 11, textTransform: 'capitalize' }}>{c.course_level || 'undergraduate'}</span></td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: c.is_active !== false ? '#f0fdf4' : '#f3f4f6', color: c.is_active !== false ? '#16a34a' : '#6b7280', padding: '3px 8px', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>
                    {c.is_active !== false ? '✅ Active' : '⏸️ Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button onClick={() => openEdit(c)} style={{ background: '#eef2ff', color: '#6366f1', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>✏️ Edit</button>
                    <button onClick={() => openOffering(c)} style={{ background: '#ecfdf5', color: '#16a34a', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>➕ Add Offering</button>
                    <button onClick={() => toggleActive(c)} style={{ background: c.is_active !== false ? '#fef2f2' : '#f0fdf4', color: c.is_active !== false ? '#dc2626' : '#16a34a', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                      {c.is_active !== false ? '⏸️' : '▶️'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No courses found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Course Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 520, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#111827' }}>
              {modal === 'edit' ? '✏️ Edit Course' : '➕ Create New Course'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Course Code *</label>
                  <input required value={form.course_code} onChange={e => setForm({ ...form, course_code: e.target.value })} placeholder="e.g. CS501" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Credits</label>
                  <input type="number" min="1" max="6" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Course Name *</label>
                <input required value={form.course_name} onChange={e => setForm({ ...form, course_name: e.target.value })} placeholder="e.g. Advanced Algorithms" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Department</label>
                  <select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} style={inputStyle}>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Level</label>
                  <select value={form.course_level} onChange={e => setForm({ ...form, course_level: e.target.value })} style={inputStyle}>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description (Optional)</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief course description..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#7c3aed', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                  {modal === 'edit' ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Offering Modal */}
      {modal === 'offering' && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 520, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#111827' }}>➕ Add Course Offering</h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>This makes the course available for student enrollment.</p>
            <form onSubmit={handleCreateOffering} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Semester *</label>
                  <select value={offeringForm.semester} onChange={e => setOfferingForm({ ...offeringForm, semester: e.target.value })} style={inputStyle}>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Academic Year</label>
                  <input type="number" value={offeringForm.academicYear} onChange={e => setOfferingForm({ ...offeringForm, academicYear: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Section</label>
                  <input value={offeringForm.section} onChange={e => setOfferingForm({ ...offeringForm, section: e.target.value })} placeholder="e.g. A" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Max Capacity</label>
                  <input type="number" min="1" value={offeringForm.maxCapacity} onChange={e => setOfferingForm({ ...offeringForm, maxCapacity: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Room Number</label>
                  <input value={offeringForm.roomNumber} onChange={e => setOfferingForm({ ...offeringForm, roomNumber: e.target.value })} placeholder="e.g. LH-401" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Schedule Days</label>
                  <input value={offeringForm.scheduleDays} onChange={e => setOfferingForm({ ...offeringForm, scheduleDays: e.target.value })} placeholder="e.g. Mon,Wed,Fri" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Start Time</label>
                  <input type="time" value={offeringForm.startTime} onChange={e => setOfferingForm({ ...offeringForm, startTime: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>End Time</label>
                  <input type="time" value={offeringForm.endTime} onChange={e => setOfferingForm({ ...offeringForm, endTime: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 12, fontSize: 13, color: '#374151' }}>
                ✅ After creating this offering, students can enroll from the <strong>Course Registration</strong> page using Semester: <strong>{offeringForm.semester}</strong>, Year: <strong>{offeringForm.academicYear}</strong>.
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Create Offering</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseManagement;
