import React, { useState } from 'react';
import { useAuth } from '../pages/AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>
      <p className="auth-subtitle">Log in to sync and edit your mind maps.</p>

      {error && <div className="auth-error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="auth-btn">
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="link-btn">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginForm