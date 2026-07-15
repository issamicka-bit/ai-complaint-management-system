// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_LABEL = {
  pending: 'Pending',
  in_progress: 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
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
    try {
      await api.post('/complaints', {
        user_id: user.user_id,
        title: formData.title,
        description: formData.description,
      });
      setFormData({ title: '', description: '' });
      setShowForm(false);
      fetchComplaints();
    } catch (err) {
      alert('Failed to submit complaint');
      console.error(err);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '60px', color: '#52605F' }}>Loading…</p>;

  return (
    <div>
      <header className="dash-header">
        <div className="brand">Sauti ya <span>Raia</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="who">{user?.full_name}</span>
          <button onClick={handleLogout} className="btn-ghost">Log out</button>
        </div>
      </header>

      <main className="dash-body">
        <div className="dash-toolbar">
          <h3>Your complaints</h3>
          <button onClick={() => setShowForm(!showForm)} className="btn-amber">
            {showForm ? 'Cancel' : '+ New complaint'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmitComplaint} className="complaint-form">
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="title">Title</label>
              <input id="title" type="text" name="title" placeholder="e.g. Water leakage on Uhuru Street" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" rows="4" placeholder="Describe what's happening, where, and since when…" value={formData.description} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary">Submit complaint</button>
          </form>
        )}

        {complaints.length === 0 ? (
          <div className="empty-state">No complaints filed yet — use "New complaint" to report an issue.</div>
        ) : (
          complaints.map((c) => (
            <div key={c.complaint_id} className="ticket">
              <div className="ticket-id">#{String(c.complaint_id).padStart(4, '0')}</div>
              <div className="ticket-body">
                <p className="ticket-title">{c.title}</p>
                <p className="ticket-desc">{c.description}</p>
                <span className="ticket-date">{new Date(c.created_at).toLocaleDateString()}</span>
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
