import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { landingFor } from '../utils/roles';

const ProtectedRoute = ({ children, allowedUserTypes = ['user', 'local guide'] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!allowedUserTypes.includes(user.type)) {
    // Signed in but not permitted here — send them to their own home, not /auth.
    return <Navigate to={landingFor(user.type)} replace />;
  }

  return children;
};

export default ProtectedRoute; 