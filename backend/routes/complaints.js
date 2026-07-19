// routes/complaints.js - Kuwasilisha na Kuona Malalamiko
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const axios = require('axios');

const AI_SERVICE_URL = 'http://localhost:8000/predict';

// ============ CREATE COMPLAINT (Wasilisha Lalamiko) ============
// POST /api/complaints
router.post('/', async (req, res) => {
  try {
    const { user_id, category_id, department_id, title, description, latitude, longitude } = req.body;

    if (!user_id || !title || !description) {
      return res.status(400).json({ success: false, message: 'user_id, title, and description are required' });
    }

    // ---- Uliza AI itabiri category na urgency ----
    let aiCategory = null;
    let aiUrgencyScore = null;
    let resolvedDepartmentId = department_id || null;

    try {
      const aiResponse = await axios.post(AI_SERVICE_URL, { title, description }, { timeout: 5000 });
      if (aiResponse.data.success) {
        aiCategory = aiResponse.data.ai_category;
        aiUrgencyScore = aiResponse.data.ai_urgency_score;

        // Kama department haikuchaguliwa moja kwa moja, itafute kutokana na AI category
        if (!resolvedDepartmentId && aiCategory) {
          const deptMatch = await pool.query(
            'SELECT department_id FROM departments WHERE name ILIKE $1 LIMIT 1',
            [`%${aiCategory}%`]
          );
          if (deptMatch.rows.length > 0) {
            resolvedDepartmentId = deptMatch.rows[0].department_id;
          }
        }
      }
    } catch (aiError) {
      // Kama AI service haipo/imezimwa, lalamiko bado linaendelea kuwasilishwa
      // bila kuainishwa na AI (aiCategory/aiUrgencyScore zitabaki null)
      console.warn('AI service unavailable, continuing without AI classification:', aiError.message);
    }

    const newComplaint = await pool.query(
      `INSERT INTO complaints
        (user_id, category_id, department_id, title, description, latitude, longitude, ai_category, ai_urgency_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user_id, category_id, resolvedDepartmentId, title, description, latitude, longitude, aiCategory, aiUrgencyScore]
    );

    // Rekodi kwenye status_history kwamba lalamiko limeanzishwa
    await pool.query(
      `INSERT INTO status_history (complaint_id, status, changed_by, remarks)
       VALUES ($1, $2, $3, $4)`,
      [newComplaint.rows[0].complaint_id, 'pending', user_id, 'Complaint submitted']
    );

    res.status(201).json({ success: true, message: 'Complaint submitted successfully', complaint: newComplaint.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============ GET ALL COMPLAINTS (Yote, kwa Mtumiaji, au kwa Idara) ============
// GET /api/complaints                    -> malalamiko yote (super admin)
// GET /api/complaints?user_id=5          -> malalamiko ya mtumiaji huyo tu (citizen)
// GET /api/complaints?department_id=2    -> malalamiko ya idara hiyo tu (officer)
router.get('/', async (req, res) => {
  try {
    const { user_id, department_id } = req.query;

    let query = `SELECT c.*, u.full_name AS citizen_name, d.name AS department_name, cat.name AS category_name
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.user_id
       LEFT JOIN departments d ON c.department_id = d.department_id
       LEFT JOIN categories cat ON c.category_id = cat.category_id`;

    const conditions = [];
    const params = [];
    if (user_id) {
      params.push(user_id);
      conditions.push(`c.user_id = $${params.length}`);
    }
    if (department_id) {
      params.push(department_id);
      conditions.push(`c.department_id = $${params.length}`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, complaints: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============ GET SINGLE COMPLAINT (Ona Lalamiko Moja) ============
// GET /api/complaints/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM complaints WHERE complaint_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Pata pia historia ya status
    const history = await pool.query(
      'SELECT * FROM status_history WHERE complaint_id = $1 ORDER BY changed_at ASC',
      [id]
    );

    res.json({ success: true, complaint: result.rows[0], history: history.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============ UPDATE COMPLAINT STATUS (Badilisha Hali ya Lalamiko) ============
// PATCH /api/complaints/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, changed_by, remarks } = req.body;

    const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const resolvedAt = status === 'resolved' ? 'NOW()' : 'NULL';

    const updated = await pool.query(
      `UPDATE complaints SET status = $1, resolved_at = ${status === 'resolved' ? 'NOW()' : 'resolved_at'}
       WHERE complaint_id = $2 RETURNING *`,
      [status, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await pool.query(
      `INSERT INTO status_history (complaint_id, status, changed_by, remarks)
       VALUES ($1, $2, $3, $4)`,
      [id, status, changed_by, remarks || '']
    );

    res.json({ success: true, message: 'Status updated', complaint: updated.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;