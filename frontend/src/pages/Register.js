import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentId: '',
    departmentId: '',
    enrollmentYear: new Date().getFullYear()
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const DEPARTMENTS = [
    { id: 1, name: 'Computer Science & Engineering (CSE)' },
    { id: 2, name: 'Information Technology (IT)' },
    { id: 3, name: 'CS with AI & ML (AIML)' },
    { id: 4, name: 'AI & Data Science (AIDS)' },
    { id: 5, name: 'CS with AI (CSAI)' },
    { id: 6, name: 'Mechanical Engineering (MECH)' },
    { id: 7, name: 'Civil Engineering (CIVIL)' },
    { id: 8, name: 'Electronics & Telecom (EXTC)' },
    { id: 9, name: 'Chemical Engineering (CHEM)' },
    { id: 10, name: 'Electronics Engineering (ETRX)' },
    { id: 11, name: 'Electronics & Computer Science (ECS)' },
    { id: 12, name: 'Biotechnology (BIOTECH)' },
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/courses/departments');
      const data = response.data.data;
      setDepartments(data && data.length > 0 ? data : DEPARTMENTS);
    } catch (err) {
      console.error('Failed to fetch departments from API, using defaults:', err);
      setDepartments(DEPARTMENTS);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId,
        departmentId: parseInt(formData.departmentId),
        enrollmentYear: parseInt(formData.enrollmentYear)
      });

      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2>Student Registration</h2>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              className="form-input"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="form-input"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input
              type="text"
              name="studentId"
              className="form-input"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              name="departmentId"
              className="form-input"
              value={formData.departmentId}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Enrollment Year</label>
            <input
              type="number"
              name="enrollmentYear"
              className="form-input"
              value={formData.enrollmentYear}
              onChange={handleChange}
              min="2020"
              max="2030"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <small className="form-text">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
