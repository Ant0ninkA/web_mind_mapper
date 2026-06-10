import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';
import '../styles/auth_styles.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-page-container">
      <div className="auth-sidebar">
        <div className="sidebar-content">
          <h1>🧠 Mind Mapper</h1>
          <p>Organize thoughts, design architectures, and structure plans visually using dynamic relational nodes.</p>
        </div>
      </div>
      <div className="auth-form-wrapper">
        <LoginForm onSwitchToRegister={() => navigate('/register')} />
      </div>
    </div>
  );
};