const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

// GET all active doctors (public)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true }).sort({ lastName: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all doctors including inactive (admin)
router.get('/all', auth, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ lastName: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET doctor by id (public)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
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

    // Generate time slots
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

    // Filter out booked slots
    const Appointment = require('../models/Appointment');
    const dateStart = new Date(date);
    dateStart.setHours(0,0,0,0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23,59,59,999);

    const booked = await Appointment.find({
      doctorId: req.params.id,
      appointmentDate: { $gte: dateStart, $lte: dateEnd },
      status: { $ne: 'cancelled' }
    });

    const bookedTimes = booked.map(a => a.appointmentTime);
    const available = slots.filter(s => !bookedTimes.includes(s));

    res.json({ slots: available });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create doctor (admin)
router.post('/', auth, async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update doctor (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
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