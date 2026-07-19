// src/pages/Login.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useLang } from '../hooks/useLang';
import { t } from '../i18n';
import { WaterIcon, ElectricityIcon, RoadsIcon, SanitationIcon, HealthIcon, EducationIcon } from '../components/DeptIcons';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M6.61 6.61A18.5 18.5 0 0 0 1 12s4 8 11 8a9.26 9.26 0 0 0 5.39-1.61" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.6 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.4-.9-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.8 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.6 3.5 24 3.5 16.3 3.5 9.6 8.2 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44.5c5.5 0 10.3-1.9 13.7-5l-6.3-5.3c-1.9 1.3-4.4 2.3-7.4 2.3-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44.5 24 44.5Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.3 5.3C41 35.9 44.5 30.5 44.5 24c0-1.2-.1-2.4-.9-3.5Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.468 2.213-1.235 3.008-.856.884-2.26 1.567-3.42 1.474-.14-1.09.41-2.24 1.19-3.02.84-.86 2.31-1.55 3.465-1.462Zm3.51 16.79c-.4.93-.87 1.79-1.5 2.59-.86 1.08-1.87 2.42-3.22 2.43-1.19.02-1.5-.75-3.13-.75-1.63 0-1.99.73-3.12.77-1.32.05-2.33-1.16-3.2-2.24-1.75-2.2-3.09-6.23-1.29-8.96 0.89-1.36 2.48-2.22 4.21-2.24 1.24-.02 2.42.83 3.18.83.76 0 2.18-1.03 3.68-.88.63.03 2.4.25 3.53 1.9-.09.06-2.11 1.23-2.09 3.68.02 2.92 2.56 3.89 2.59 3.9-.02.06-.4 1.4-1.34 2.92Z" />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const [lang, setLang] = useLang();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const completeLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    const role = data.user.role;
    navigate(role === 'officer' || role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      completeLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || t('invalidLogin', lang));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    setError('');
    try {
      const res = await api.post('/auth/google', { credential: response.credential });
      completeLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      width: 260,
      text: 'continue_with',
    });
  }, []);

  const handleAppleClick = () => {
    alert('Sign in with Apple requires an Apple Developer account and will be added in a future update.');
  };

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <span className="mark">{t('appTagline', lang)}</span>
        <div>
          <h1>Every complaint reaches the <span className="accent">right desk</span>, on record.</h1>
          <p>{t('loginSub', lang)}</p>
        </div>
        <div className="feed-card">
          <div className="feed-title"><span className="sys-dot"></span>Live activity</div>
          <div className="feed-row">
            <span>#0847 · Water leakage, Uhuru St</span>
            <span className="feed-tag water">Water</span>
          </div>
          <div className="feed-row">
            <span>#0846 · Power line down, Kariakoo</span>
            <span className="feed-tag electricity">Power</span>
          </div>
          <div className="feed-row">
            <span>#0845 · Pothole, Mbezi road</span>
            <span className="feed-tag roads">Roads</span>
          </div>
        </div>
        <div className="sys-row"><span className="sys-dot"></span>{t('sysOnline', lang)}</div>
      </div>

      <div className="auth-main">
        <div className="auth-toolbar-row" style={{ position: 'absolute', top: '24px', right: '32px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <LanguageToggle lang={lang} onChange={setLang} />
          <ThemeToggle />
        </div>
        <div className="auth-card">
          <div className="eyebrow">{t('officerAccess', lang)}</div>
          <h2>{t('welcomeBack', lang)}</h2>
          <p className="sub">{t('signInSub', lang)}</p>

          {error && <div className="auth-error">{error}</div>}

          {/* Google renders its own button into this div */}
          <div ref={googleBtnRef} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}></div>

          <button type="button" className="social-btn" onClick={handleAppleClick}>
            <AppleIcon /> Continue with Apple
          </button>

          <div className="auth-divider">or</div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">{t('email', lang)}</label>
              <input id="email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="password">{t('password', lang)}</label>
              <div className="password-field-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('signingIn', lang) : t('signIn', lang)}
            </button>
          </form>

          <p className="auth-switch">{t('newHere', lang)} <Link to="/register">{t('createAccount', lang)}</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
