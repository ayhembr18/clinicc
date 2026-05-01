const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  service: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true }, // "10:30"
  reason: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  ticketNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Generate ticket number before save
appointmentSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const date = new Date();
    const prefix = `CLN${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}`;
    const count = await mongoose.model('Appointment').countDocuments();
    this.ticketNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);