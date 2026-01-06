import { useState, FormEvent } from 'react';
import { login } from '../services/auth';
import './Login.css';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(password);
      if (success) {
        onSuccess();
      } else {
        setError('Incorrect password');
      }
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="Focus Integrated Fitness" className="login-logo" />
        <h2>Employee Login</h2>
        <p>Enter the password to access the intake processor</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="login-input"
            disabled={loading}
            autoFocus
          />

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button" disabled={loading || !password}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
