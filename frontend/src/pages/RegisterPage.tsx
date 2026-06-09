import React, { useState } from 'react';
import { RegisterForm } from '../components/RegisterForm';
import '../Auth.css';

export const RegisterPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page-container">
      <div className="auth-sidebar">
        <div className="sidebar-content">
          <h1>🧠 Mind Mapper</h1>
          <p>Organize thoughts, design architectures, and structure plans visually using dynamic relational nodes.</p>
        </div>
      </div>
      <div className="auth-form-wrapper">
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      </div>
    </div>
  );
};