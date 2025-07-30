import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component that redirects to the profile page for authentication
 * if the user is not logged in
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // If auth is still loading, don't render anything yet
  if (loading) {
    return null;
  }

  // If user is not authenticated, redirect to profile page for login
  if (!currentUser) {
    return <Navigate to="/profile" replace />;
  }

  // If user is authenticated, render the children components
  return children;
};

export default ProtectedRoute;
