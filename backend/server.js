// server.js - Entry point ya Backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const complaintsRoutes = require('./routes/complaints');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);

// Route ya kutesti kama server inafanya kazi
app.get('/', (req, res) => {
  res.send('Complaint Management System backend is running!');
});

// Route ya kutesti connection na database
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route ya kuona departments zote (kutoka database)
app.get('/api/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});