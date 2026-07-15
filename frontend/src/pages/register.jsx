// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Register() {
  const navigate = useNavigate();
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
        <span className="mark">Sauti ya Raia · Civic Reporting</span>
        <div>
          <h1>Report an issue once. Follow it through to done.</h1>
          <p>Create an account to file complaints about water, power, roads, and sanitation — and see exactly where each one stands.</p>
        </div>
        <div className="stat-row">
          <div className="stat"><b>08</b><span>Departments</span></div>
          <div className="stat"><b>24/7</b><span>Submission</span></div>
          <div className="stat"><b>AI</b><span>Auto-routed</span></div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="eyebrow">Create Account</div>
          <h2>Join Sauti ya Raia</h2>
          <p className="sub">A few details, and you're ready to file your first report.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="full_name">Full name</label>
              <input id="full_name" type="text" name="full_name" placeholder="Jane Mwananchi" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" type="tel" name="phone" placeholder="07XX XXX XXX" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
