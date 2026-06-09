import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#4f46e5' }}>
        <h3>Loading your workspace...</h3>
      </div>
    );
  }

  // If no cookie session exists, redirect them out to the login/landing view cleanly
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};