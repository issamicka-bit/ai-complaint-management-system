// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useLang } from '../hooks/useLang';
import { t } from '../i18n';

function Register() {
  const navigate = useNavigate();
  const [lang, setLang] = useLang();
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <span className="mark">{t('appTagline', lang)}</span>
        <div>
          <h1>{t('registerHeadline', lang)}</h1>
          <p>{t('registerSub', lang)}</p>
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
          <div className="eyebrow">{t('createAccountTitle', lang)}</div>
          <h2>{t('joinTitle', lang)}</h2>
          <p className="sub">{t('joinSub', lang)}</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="full_name">{t('fullName', lang)}</label>
              <input id="full_name" type="text" name="full_name" placeholder="Jane Mwananchi" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="email">{t('email', lang)}</label>
              <input id="email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="phone">{t('phone', lang)}</label>
              <input id="phone" type="tel" name="phone" placeholder="07XX XXX XXX" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="password">{t('password', lang)}</label>
              <input id="password" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('registering', lang) : t('register', lang)}
            </button>
          </form>

          <p className="auth-switch">{t('alreadyRegistered', lang)} <Link to="/login">{t('signInLink', lang)}</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
