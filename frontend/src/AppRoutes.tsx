import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import MindmapDashboard from './pages/MindmapDashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MindmapDashboard />} />
      <Route path="/login" element={<MindmapDashboard />} />
      <Route path="/register" element={<MindmapDashboard />} />
      <Route path="/map" element={<App />} />
      <Route path="/map/:id" element={<App />} />
      <Route path="/shared/:token" element={<MindmapDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
