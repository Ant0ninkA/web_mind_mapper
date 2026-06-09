import React, { useState } from 'react';
import { useAuth } from '../api/authentication';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [validationDetails, setValidationDetails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setValidationDetails([]);
    setIsSubmitting(true);

    try {
      await register(email, username, password);
    } catch (err: any) {
      if (err.status === 400 && err.details) {
        setValidationDetails(err.details);
      } else {
        setGlobalError(err.message || 'Registration failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <p className="auth-subtitle">Save your maps to the cloud and collaborate.</p>

      {globalError && <div className="auth-error-banner">{globalError}</div>}

      {}
      {validationDetails.length > 0 && (
        <div className="auth-error-list">
          <p>Please fix the following issues:</p>
          <ul>
            {validationDetails.map((detail, idx) => (
              <li key={idx}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="mindmapper42"
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="auth-btn">
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="link-btn">
          Log In
        </button>
      </p>
    </div>
  );
};

export default RegisterForm