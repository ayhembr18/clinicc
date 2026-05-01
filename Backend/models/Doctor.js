const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true }, // 0=Sun, 1=Mon...6=Sat
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "17:00"
  slotDurationMinutes: { type: Number, default: 30 }
});

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  specialty: { type: String, required: true, trim: true },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  photo: { type: String, default: '' },
  availability: [availabilitySlotSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);