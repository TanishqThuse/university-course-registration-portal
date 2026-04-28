import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to appropriate dashboard if wrong role
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

export default PrivateRoute;
