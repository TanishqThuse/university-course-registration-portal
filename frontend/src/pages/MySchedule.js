import React, { useState, useEffect } from 'react';
import api from '../services/api';

function MySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/registration/my-schedule');
      setSchedule(response.data.data.filter(course => course.status === 'enrolled'));
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      setMessage({ type: 'error', text: 'Failed to load schedule' });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (enrollmentId, courseName) => {
    if (!window.confirm(`Are you sure you want to drop ${courseName}?`)) {
      return;
    }

    try {
      await api.delete(`/registration/drop/${enrollmentId}`);
      setMessage({ type: 'success', text: `Successfully dropped ${courseName}` });
      fetchSchedule();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to drop course'
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading schedule...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', padding: '20px' }}>
      <div className="page-header">
        <h1>My Schedule</h1>
        <p>View and manage your enrolled courses</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
          >
            ×
          </button>
        </div>
      )}

      {schedule.length === 0 ? (
        <div className="empty-state">
          <h3>No courses enrolled</h3>
          <p>You haven't registered for any courses yet</p>
        </div>
      ) : (
        <div className="schedule-table">
          {schedule.map(course => (
            <div key={course.enrollment_id} className="schedule-item">
              <div className="schedule-item-header">
                <div className="schedule-course-info">
                  <h3>
                    {course.course_code} - {course.course_name}
                  </h3>
                  <p>
                    Section {course.section} | {course.credits} Credits | {course.semester} {course.academic_year}
                  </p>
                </div>
                <button
                  onClick={() => handleDrop(course.enrollment_id, course.course_name)}
                  className="btn btn-danger btn-sm"
                >
                  Drop Course
                </button>
              </div>

              <div className="schedule-details">
                {course.schedule_days && course.start_time && (
                  <div>
                    <strong>Schedule:</strong> {course.schedule_days} {course.start_time} - {course.end_time}
                  </div>
                )}
                {course.room_number && (
                  <div>
                    <strong>Room:</strong> {course.room_number}
                  </div>
                )}
                {course.faculty_name && (
                  <div>
                    <strong>Instructor:</strong> {course.faculty_name}
                  </div>
                )}
                {course.grade && course.is_grade_published && (
                  <div>
                    <strong>Grade:</strong> <span className="badge badge-info">{course.grade}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Total Credits</h3>
        <p style={{ fontSize: '24px', fontWeight: '600', color: '#2563eb' }}>
          {schedule.reduce((sum, course) => sum + course.credits, 0)} Credits
        </p>
      </div>
    </div>
  );
}

export default MySchedule;
