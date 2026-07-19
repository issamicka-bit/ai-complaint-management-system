// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useLang } from '../hooks/useLang';
import { t } from '../i18n';

function Dashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useLang();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const STATUS_LABEL = {
    pending: t('pending', lang),
    in_progress: t('inProgress', lang),
    resolved: t('resolved', lang),
    rejected: t('rejected', lang),
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchComplaints(parsedUser.user_id);
  }, []);

  const fetchComplaints = async (userId) => {
    try {
      const res = await api.get(`/complaints?user_id=${userId}`);
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/complaints', {
        user_id: user.user_id,
        title: formData.title,
        description: formData.description,
      });
      setFormData({ title: '', description: '' });
      setShowForm(false);
      fetchComplaints(user.user_id);
    } catch (err) {
      alert('Failed to submit complaint');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const counts = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <p style={{ color: 'var(--ink-soft)' }}>{t('loading', lang)}</p>
      </div>
    );
  }

  return (
    <div>
      <header className="dash-header">
        <div className="brand">Sauti ya <span>Raia</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <LanguageToggle lang={lang} onChange={setLang} />
          <ThemeToggle />
          <span className="who">{user?.full_name}</span>
          <button onClick={handleLogout} className="btn-ghost">{t('logout', lang)}</button>
        </div>
      </header>

      <main className="dash-body">
        <div className="stat-grid" style={{ marginBottom: '26px' }}>
          <div className="stat-card" style={{ '--stat-color': '#8E9BB8', cursor: 'default' }}>
            <div className="stat-label"><span className="stat-dot"></span>{t('yourComplaints', lang)}</div>
            <div className="stat-value" style={{ color: 'var(--ink)' }}>{counts.total}</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': '#F5A524', cursor: 'default' }}>
            <div className="stat-label"><span className="stat-dot"></span>{t('pending', lang)}</div>
            <div className="stat-value" style={{ color: 'var(--ink)' }}>{counts.pending}</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': '#2ECC8F', cursor: 'default' }}>
            <div className="stat-label"><span className="stat-dot"></span>{t('resolved', lang)}</div>
            <div className="stat-value" style={{ color: 'var(--ink)' }}>{counts.resolved}</div>
          </div>
        </div>

        <div className="dash-toolbar">
          <h3>{t('yourComplaints', lang)}</h3>
          <button onClick={() => setShowForm(!showForm)} className="btn-amber">
            {showForm ? t('cancel', lang) : t('newComplaint', lang)}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmitComplaint} className="complaint-form">
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="title">{t('title', lang)}</label>
              <input id="title" type="text" name="title" placeholder="e.g. Water leakage on Uhuru Street" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="description">{t('description', lang)}</label>
              <textarea id="description" name="description" rows="4" placeholder="Describe what's happening, where, and since when…" value={formData.description} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? t('submitting', lang) : t('submitComplaint', lang)}
            </button>
          </form>
        )}

        {complaints.length === 0 ? (
          <div className="empty-state">{t('noComplaints', lang)}</div>
        ) : (
          complaints.map((c) => (
            <div key={c.complaint_id} className="ticket">
              <div className="ticket-id">#{String(c.complaint_id).padStart(4, '0')}</div>
              <div className="ticket-body">
                <p className="ticket-title">{c.title}</p>
                <p className="ticket-desc">{c.description}</p>
                <span className="ticket-date">
                  {c.department_name || 'Unassigned'} · {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <span className={`stamp ${c.status}`}>{STATUS_LABEL[c.status] || c.status}</span>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default Dashboard;
