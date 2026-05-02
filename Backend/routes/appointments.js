const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const transporter = require('../utils/mailer');

// POST create appointment (public)
router.post('/', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET appointment by ticket number (public - for download)
router.get('/ticket/:ticketNumber', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ ticketNumber: req.params.ticketNumber }).populate('doctorId', 'firstName lastName specialty');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all appointments (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, service, date, doctorId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (service) filter.service = service;
    if (doctorId) filter.doctorId = doctorId;
    if (date) {
      const start = new Date(date); start.setHours(0,0,0,0);
      const end = new Date(date); end.setHours(23,59,59,999);
      filter.appointmentDate = { $gte: start, $lte: end };
    }
    const appointments = await Appointment.find(filter).sort({ createdAt: -1 }).populate('doctorId', 'firstName lastName specialty');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update appointment status (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Send email notification when status changes to confirmed or cancelled
    if (req.body.status === 'confirmed' || req.body.status === 'cancelled') {
      const isConfirmed = req.body.status === 'confirmed';
      const date = new Date(appointment.appointmentDate).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      try {
        await transporter.sendMail({
          from: `"ClinicUrgence" <${process.env.EMAIL_FROM}>`,
          to: appointment.email,
          subject: isConfirmed
            ? ` Rendez-vous confirmé — ${appointment.ticketNumber}`
            : ` Rendez-vous annulé — ${appointment.ticketNumber}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #0a3d27; margin-bottom: 4px;">ClinicUrgence</h2>
              <p style="color: #9ca3af; font-size: 0.85rem; margin-top: 0;">12 Rue de la Santé, Tunis 1002 — +216 71 234 567</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p>Bonjour <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
              <p>Votre rendez-vous <strong>${appointment.ticketNumber}</strong> a été
                <strong style="color: ${isConfirmed ? '#1f9d5f' : '#e53e3e'}">
                  ${isConfirmed ? 'confirmé ' : 'annulé '}
                </strong>.
              </p>
              ${isConfirmed ? `
              <div style="background: #eaf9f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1f9d5f;">
                <p style="margin: 6px 0;"><strong>Médecin :</strong> ${appointment.doctorName}</p>
                <p style="margin: 6px 0;"><strong>Service :</strong> ${appointment.service}</p>
                <p style="margin: 6px 0;"><strong>Date :</strong> ${date}</p>
                <p style="margin: 6px 0;"><strong>Heure :</strong> ${appointment.appointmentTime}</p>
              </div>
              <p style="color: #4b5563; font-size: 0.9rem;">
                Veuillez vous présenter <strong>15 minutes avant</strong> votre rendez-vous muni(e) d'une pièce d'identité.
              </p>
              ` : `
              <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e53e3e;">
                <p style="margin: 6px 0; color: #4b5563;">
                  Pour reprendre un rendez-vous, visitez notre site ou appelez-nous au <strong>+216 71 234 567</strong>.
                </p>
              </div>
              `}
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 0.78rem; text-align: center;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
              </p>
            </div>
          `
        });
      } catch (mailErr) {
        // Log mail error but don't fail the request
        console.error('Email sending failed:', mailErr.message);
      }
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE appointment (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET stats (admin)
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const confirmed = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelled = await Appointment.countDocuments({ status: 'cancelled' });
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const todayCount = await Appointment.countDocuments({ appointmentDate: { $gte: today, $lte: todayEnd } });
    res.json({ total, pending, confirmed, cancelled, todayCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;