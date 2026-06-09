import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import '../Auth.css';

export const LoginPage: React.FC = () => {
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
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      </div>
    </div>
  );
};