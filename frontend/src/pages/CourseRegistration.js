import React, { useState, useEffect } from 'react';
import api from '../services/api';

function CourseRegistration() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    semester: 'Spring',
    academicYear: 2026,
    department: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDepartments();
    fetchAvailableCourses();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/courses/departments');
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchAvailableCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      if (filters.department) params.append('department', filters.department);

      const response = await api.get(`/registration/available-courses?${params}`);
      setCourses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setMessage({ type: 'error', text: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleEnroll = async (offeringId, courseName) => {
    try {
      await api.post('/registration/enroll', {
        courseOfferingId: offeringId
      });

      setMessage({
        type: 'success',
        text: `Successfully enrolled in ${courseName}!`
      });

      // Refresh courses
      fetchAvailableCourses();
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.data?.missingPrerequisites) {
        const prereqs = errorData.data.missingPrerequisites
          .map(p => `${p.courseCode} (${p.reason})`)
          .join(', ');
        setMessage({
          type: 'error',
          text: `Prerequisites not met: ${prereqs}`
        });
      } else if (errorData?.data?.conflicts) {
        const conflicts = errorData.data.conflicts
          .map(c => `${c.courseCode} (${c.schedule})`)
          .join(', ');
        setMessage({
          type: 'error',
          text: `Schedule conflict with: ${conflicts}`
        });
      } else if (errorData?.data?.totalCredits) {
        setMessage({
          type: 'error',
          text: `Credit limit exceeded. Current: ${errorData.data.currentCredits}, Adding: ${errorData.data.newCredits}, Max: ${errorData.data.maxCredits}`
        });
      } else {
        setMessage({
          type: 'error',
          text: errorData?.message || 'Enrollment failed'
        });
      }
    }
  };

  const handleJoinWaitlist = async (offeringId, courseName) => {
    try {
      const response = await api.post('/registration/waitlist', {
        courseOfferingId: offeringId
      });

      setMessage({
        type: 'success',
        text: `Added to waitlist for ${courseName}. Position: ${response.data.data.position}`
      });

      fetchAvailableCourses();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to join waitlist'
      });
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1400px', padding: '20px' }}>
      <div className="page-header">
        <h1>Course Registration</h1>
        <p>Browse and enroll in available courses</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
          {message.text}
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
          >
            ×
          </button>
        </div>
      )}

      <div className="filters">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Semester</label>
            <select
              name="semester"
              className="form-input"
              value={filters.semester}
              onChange={handleFilterChange}
            >
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <input
              type="number"
              name="academicYear"
              className="form-input"
              value={filters.academicYear}
              onChange={handleFilterChange}
              min="2020"
              max="2030"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              name="department"
              className="form-input"
              value={filters.department}
              onChange={handleFilterChange}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses available</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(course => {
            const availableSeats = course.available_seats;
            const isFull = availableSeats <= 0;

            return (
              <div key={course.offering_id} className="course-card">
                <div className="course-card-header">
                  <div className="course-code">{course.course_code}</div>
                  <div className="course-name">{course.course_name}</div>
                </div>

                <div className="course-info">
                  <span>Credits: {course.credits}</span>
                  <span>Section: {course.section}</span>
                  <span>{course.department_name}</span>
                </div>

                {course.schedule_days && course.start_time && (
                  <div className="course-schedule">
                    📅 {course.schedule_days} {course.start_time} - {course.end_time}
                    {course.room_number && ` | Room: ${course.room_number}`}
                  </div>
                )}

                {course.faculty_name && (
                  <div className="course-schedule">
                    👨‍🏫 {course.faculty_name}
                  </div>
                )}

                <div className="course-capacity">
                  <span className={isFull ? 'seats-full' : 'seats-available'}>
                    {isFull ? '❌ Full' : `✅ ${availableSeats} seats available`}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>
                    ({course.current_enrollment}/{course.max_capacity})
                  </span>
                </div>

                {course.description && (
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>
                    {course.description}
                  </p>
                )}

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  {!isFull ? (
                    <button
                      onClick={() => handleEnroll(course.offering_id, course.course_name)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Enroll
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinWaitlist(course.offering_id, course.course_name)}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Join Waitlist
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CourseRegistration;
