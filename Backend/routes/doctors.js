const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const transporter = require('../utils/mailer');

// Generate a random password
function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  let pass = '';
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

// GET all active doctors (public)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true }).sort({ lastName: 1 }).select('-password -tempPassword');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all doctors including inactive (admin)
router.get('/all', auth, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ lastName: 1 }).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET doctor by id (public)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password -tempPassword');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET available time slots for a doctor on a given date (public)
router.get('/:id/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date required' });

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const dayAvailability = doctor.availability.find(a => a.dayOfWeek === dayOfWeek);
    if (!dayAvailability) return res.json({ slots: [] });

    const slots = [];
    const [startH, startM] = dayAvailability.startTime.split(':').map(Number);
    const [endH, endM] = dayAvailability.endTime.split(':').map(Number);
    const duration = dayAvailability.slotDurationMinutes || 30;

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
      current += duration;
    }

    const Appointment = require('../models/Appointment');
    const dateStart = new Date(date); dateStart.setHours(0,0,0,0);
    const dateEnd = new Date(date); dateEnd.setHours(23,59,59,999);
    const booked = await Appointment.find({
      doctorId: req.params.id,
      appointmentDate: { $gte: dateStart, $lte: dateEnd },
      status: { $nin: ['cancelled'] }
    });
    const bookedTimes = booked.map(a => a.postponedTime || a.appointmentTime);
    const available = slots.filter(s => !bookedTimes.includes(s));

    res.json({ slots: available });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create doctor (admin) — generates credentials and sends welcome email
router.post('/', auth, async (req, res) => {
  try {
    const tempPassword = generatePassword();
    const doctor = new Doctor({ ...req.body, password: tempPassword, tempPassword });
    await doctor.save();

    // Send welcome email with credentials
    if (doctor.email) {
      try {
        await transporter.sendMail({
          from: `"ClinicUrgence" <${process.env.EMAIL_FROM}>`,
          to: doctor.email,
          subject: ' Bienvenue à ClinicUrgence — Vos accès médecin',
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
              <h2 style="color:#0a3d27;">ClinicUrgence</h2>
              <p>Bonjour <strong>Dr. ${doctor.firstName} ${doctor.lastName}</strong>,</p>
              <p>Bienvenue dans notre équipe médicale ! Votre espace médecin a été créé avec succès.</p>
              <div style="background:#eaf9f0;padding:24px;border-radius:8px;margin:24px 0;border-left:4px solid #1f9d5f;">
                <p style="margin:0 0 8px 0;font-weight:700;color:#0a3d27;">Vos identifiants de connexion :</p>
                <p style="margin:6px 0;"><strong>Email :</strong> ${doctor.email}</p>
                <p style="margin:6px 0;"><strong>Mot de passe :</strong> <code style="background:#fff;padding:3px 8px;border-radius:4px;font-size:1rem;letter-spacing:0.05em;">${tempPassword}</code></p>
              </div>
              <p>Connectez-vous à votre espace médecin ici :</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctor/login"
                 style="display:inline-block;background:#1f9d5f;color:white;padding:12px 24px;border-radius:100px;text-decoration:none;font-weight:600;margin:8px 0;">
                Accéder à mon espace →
              </a>
              <p style="color:#6b7280;font-size:0.85rem;margin-top:20px;">
                Nous vous recommandons de changer votre mot de passe lors de votre première connexion.
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
              <p style="color:#9ca3af;font-size:0.78rem;">ClinicUrgence — 12 Rue de la Santé, Tunis 1002</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('Welcome email failed:', mailErr.message);
      }
    }

    const doctorObj = doctor.toObject();
    delete doctorObj.password;
    res.status(201).json(doctorObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update doctor (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    // Don't allow overwriting password via this route unless explicitly set
    if (req.body.password === '') delete req.body.password;
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE doctor (admin) - soft delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;