import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AuthPage } from '../AuthPage'; 

const MindmapDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      if (!location.pathname.startsWith('/shared/')) {
        navigate('/map');
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading your mind maps...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="dashboard-container" style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Your Mind Maps</h1>
      <p>Redirecting you to your canvas workspace...</p>
    </div>
  );
};

export default MindmapDashboard;