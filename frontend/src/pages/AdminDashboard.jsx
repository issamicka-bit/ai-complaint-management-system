// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useLang } from '../hooks/useLang';
import { t } from '../i18n';

const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved', 'rejected'];

const STAT_COLORS = {
  all: '#8E9BB8',
  pending: '#F5A524',
  in_progress: '#3B8FF3',
  resolved: '#2ECC8F',
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useLang();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [deptFilter, setDeptFilter] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const STATUS_LABEL = {
    pending: t('pending', lang),
    in_progress: t('inProgress', lang),
    resolved: t('resolved', lang),
    rejected: t('rejected', lang),
  };

  const isSuperAdmin = user?.role === 'admin';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'officer' && parsedUser.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    setUser(parsedUser);

    // Officer: amefungwa kwenye idara yake pekee. Admin (super admin): anaona zote.
    if (parsedUser.role === 'officer' && parsedUser.department_id) {
      fetchComplaints(parsedUser.department_id);
    } else {
      fetchComplaints();
      fetchDepartments();
    }
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async (departmentId) => {
    try {
      const url = departmentId ? `/complaints?department_id=${departmentId}` : '/complaints';
      const res = await api.get(url);
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptFilterChange = (value) => {
    setDeptFilter(value);
    fetchComplaints(value || undefined);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await api.patch(`/complaints/${complaintId}/status`, {
        status: newStatus,
        changed_by: user.user_id,
        remarks: `Status updated to ${newStatus}`,
      });
      if (user.role === 'officer' && user.department_id) {
        fetchComplaints(user.department_id);
      } else {
        fetchComplaints(deptFilter || undefined);
      }
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredComplaints = filter === 'all'
    ? complaints
    : complaints.filter((c) => c.status === filter);

  const counts = {
    all: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  };

  if (loading) return <div className="admin-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#8E9BB8' }}>{t('loading', lang)}</p></div>;

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="brand">
          <span className="dot"></span>Sauti ya <span>Raia</span>
          {!isSuperAdmin && user?.department_id && departments.length === 0 && (
            <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)', marginLeft: '10px' }}>
              · Officer
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LanguageToggle lang={lang} onChange={setLang} />
          <ThemeToggle />
          <span className="who">{user?.full_name}</span>
          <button onClick={handleLogout} className="btn-dark-ghost">{t('logout', lang)}</button>
        </div>
      </header>

      <main className="admin-body">
        {isSuperAdmin && (
          <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12.5px', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>
              Department:
            </label>
            <select
              value={deptFilter}
              onChange={(e) => handleDeptFilterChange(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '7px',
                border: '1px solid var(--line)',
                background: 'var(--paper-raised)',
                color: 'var(--ink)',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
              }}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="stat-grid">
          {[
            { key: 'all', label: t('totalComplaints', lang), value: counts.all },
            { key: 'pending', label: t('pending', lang), value: counts.pending },
            { key: 'in_progress', label: t('inProgress', lang), value: counts.in_progress },
            { key: 'resolved', label: t('resolved', lang), value: counts.resolved },
          ].map((s) => (
            <div
              key={s.key}
              className={`stat-card ${filter === s.key ? 'active' : ''}`}
              style={{ '--stat-color': STAT_COLORS[s.key] }}
              onClick={() => setFilter(s.key)}
            >
              <div className="stat-label"><span className="stat-dot"></span>{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="admin-empty">{t('noComplaintsCategory', lang)}</div>
        ) : (
          filteredComplaints.map((c) => (
            <div key={c.complaint_id} className="admin-ticket">
              <div className="top-row">
                <div>
                  <p className="ticket-title">#{String(c.complaint_id).padStart(4, '0')} — {c.title}</p>
                  <p className="ticket-desc">{c.description}</p>
                  <span className="ticket-meta">
                    {c.citizen_name || 'Unknown'} · {c.department_name || 'Unassigned'} ·{' '}
                    {new Date(c.created_at).toLocaleDateString()}
                    {c.ai_category ? ` · AI: ${c.ai_category}` : ''}
                  </span>
                </div>
                <span className={`status-pill ${c.status}`}>{STATUS_LABEL[c.status] || c.status}</span>
              </div>

              <div className="action-row">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(c.complaint_id, s)}
                    disabled={c.status === s || updatingId === c.complaint_id}
                    className={`status-btn ${s}`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
