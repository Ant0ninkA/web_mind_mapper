import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import MindmapDashboard from './pages/MindmapDashboard';
import { ProtectedRoute } from './components/ProtectedRoute'; // Guard wrapper

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Publicly visible auth/landing views */}
      <Route path="/" element={<MindmapDashboard />} />
      <Route path="/login" element={<MindmapDashboard />} />
      <Route path="/register" element={<MindmapDashboard />} />
      <Route path="/shared/:token" element={<MindmapDashboard />} />
      
      {/* Protected canvas paths—redirects guests instantly */}
      <Route 
        path="/map" 
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/map/:id" 
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;