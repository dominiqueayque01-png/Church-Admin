import { useState } from 'react';
import { Cross, User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { loginStationUser } from '../../services/api';
import './Login.css';

const MOCK_USERS = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'System Admin', avatarInitials: 'SA' },
  { id: '2', username: 'usher1', password: 'usher123', role: 'usher', name: 'John Usher', avatarInitials: 'JU' },
];

type Props = {
  onLoginSuccess: (user: any) => void;
};

export default function LoginPage({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const user = await loginStationUser(username, password);
      if (user) {
        onLoginSuccess(user);
        return;
      } else {
        // Try fallback mock if database is not yet populated
        const mockUser = MOCK_USERS.find(
          u => u.username.toLowerCase() === username.toLowerCase().trim()
            && u.password === password
        );
        if (mockUser) {
          onLoginSuccess(mockUser);
          return;
        }
        setError('Invalid credentials. Check username or password.');
      }
    } catch (err: any) {
      // Fallback for offline/unconfigured Supabase
      const mockUser = MOCK_USERS.find(
        u => u.username.toLowerCase() === username.toLowerCase().trim()
          && u.password === password
      );
      if (mockUser) {
        onLoginSuccess(mockUser);
        return;
      }
      setError(err?.message || 'Connection error. Check credentials or Supabase URL.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (userType: 'admin' | 'usher') => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('usher1');
      setPassword('usher123');
    }
    setError('');
  };

  return (
    <div className="login">
      {/* Ambient background glows */}
      <div className="login__ambient login__ambient--top" />
      <div className="login__ambient login__ambient--bottom" />

      {/* Center container */}
      <div className="login__wrapper">
        {/* Sacred Brand Header */}
        <div className="login__brand">
          <div className="login__seal">
            <div className="login__seal-ring" />
            <div className="login__seal-inner">
              <Cross size={32} strokeWidth={2.2} className="login__cross-icon" />
            </div>
          </div>
          <span className="login__tag">SACRED MINISTRY MANAGEMENT</span>
          <h1 className="login__church">Grace Sanctuary</h1>
          <p className="login__subtitle">Church Administration & Members Profiling System</p>
          <div className="login__gold-bar" />
        </div>

        {/* Login Glassmorphic Card */}
        <div className="login__card">
          <div className="login__card-header">
            <h2 className="login__title">Welcome Back</h2>
            <p className="login__sub">Sign in with authorized administrator credentials</p>
          </div>

          {error && (
            <div className="login__error" role="alert">
              <span className="login__error-dot" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login__form">
            {/* Username field */}
            <div className="login__field">
              <label className="login__label" htmlFor="username">
                Username or ID
              </label>
              <div className="login__input-box">
                <User size={17} className="login__input-icon" />
                <input
                  id="username"
                  className="login__input"
                  type="text"
                  placeholder="e.g. admin or usher1"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password field */}
            <div className="login__field">
              <div className="login__label-row">
                <label className="login__label" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="login__input-box">
                <Lock size={17} className="login__input-icon" />
                <input
                  id="password"
                  className="login__input login__input--password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your security password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login__eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="login__btn"
              disabled={loading}
            >
              {loading ? (
                <span className="login__btn-loading">
                  <span className="login__spinner" />
                  <span>Verifying credentials...</span>
                </span>
              ) : (
                <span className="login__btn-content">
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={17} className="login__btn-arrow" />
                </span>
              )}
            </button>
          </form>

          {/* One-click Demo Accounts Pill Section */}
          <div className="login__quick-access">
            <div className="login__quick-header">
              <Sparkles size={13} className="login__quick-icon" />
              <span>Quick Demo Access</span>
            </div>
            <div className="login__demo-pills">
              <button
                type="button"
                className="login__demo-pill"
                onClick={() => fillDemo('admin')}
                title="Fill Admin credentials"
              >
                <span className="login__demo-dot login__demo-dot--admin" />
                <span>Admin Portal</span>
                <span className="login__demo-code">admin</span>
              </button>
              <button
                type="button"
                className="login__demo-pill"
                onClick={() => fillDemo('usher')}
                title="Fill Usher credentials"
              >
                <span className="login__demo-dot login__demo-dot--usher" />
                <span>Usher Tablet</span>
                <span className="login__demo-code">usher1</span>
              </button>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="login__footer">
            <ShieldCheck size={14} className="login__security-icon" />
            <span>Secure Cloud Session · Grace Ecclesia v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}