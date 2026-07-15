// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <span className="mark">Sauti ya Raia · Civic Reporting</span>
        <div>
          <h1>Every complaint reaches the right desk, on record.</h1>
          <p>A shared channel between citizens and department officers — submitted, classified, and tracked from first report to resolution.</p>
        </div>
        <div className="stat-row">
          <div className="stat"><b>08</b><span>Departments</span></div>
          <div className="stat"><b>24/7</b><span>Submission</span></div>
          <div className="stat"><b>AI</b><span>Auto-routed</span></div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="eyebrow">Officer &amp; Citizen Access</div>
          <h2>Welcome back</h2>
          <p className="sub">Sign in to file or track a complaint.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
