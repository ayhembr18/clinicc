const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const JWT_SECRET = process.env.JWT_SECRET || 'clinic_secret_key_2024';

// POST /api/doctor-auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email: email.toLowerCase(), isActive: true });
    if (!doctor || !doctor.password) {
      return res.status(400).json({ message: 'Identifiants incorrects' });
    }

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Identifiants incorrects' });

    const token = jwt.sign(
      { doctorId: doctor._id, email: doctor.email, name: `Dr. ${doctor.firstName} ${doctor.lastName}` },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        email: doctor.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;