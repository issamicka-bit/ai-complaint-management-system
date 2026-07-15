// routes/auth.js - Kujisajili (Register) na Kuingia (Login)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ============ REGISTER (Kujisajili) ============
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    // Hakikisha taarifa muhimu zimetumwa
    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
    }

    // Angalia kama email tayari ipo
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Ficha (hash) password kabla ya kuhifadhi
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Weka role ya default kama "citizen" kama haikutumwa
    const userRole = role || 'citizen';

    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, full_name, email, role, created_at`,
      [full_name, email, phone, hashedPassword, userRole]
    );

    res.status(201).json({ success: true, message: 'User registered successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============ LOGIN (Kuingia) ============
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Tafuta mtumiaji kwa email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Linganisha password aliyoingiza na ile iliyofichwa (hashed)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Tengeneza token (kama "kitambulisho" cha muda cha mtumiaji aliyeingia)
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_badilisha_hii',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;