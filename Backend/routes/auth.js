const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'clinic_secret_key_2024';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, admin: { id: admin._id, username: admin.username, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/setup — create default admin (run once)
router.post('/setup', async (req, res) => {
  try {
    const existing = await Admin.findOne({ username: 'admin' });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });
    const admin = new Admin({ username: 'admin', password: 'admin123', email: 'admin@clinic.com' });
    await admin.save();
    res.json({ message: 'Admin created: username=admin, password=admin123' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;