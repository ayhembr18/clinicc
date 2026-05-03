const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String,
  duration: String,
  instructions: String
});

const ordonnanceSchema = new mongoose.Schema({
  medicines: [medicineSchema],
  notes: { type: String, default: '' },
  issuedAt: { type: Date, default: Date.now }
});

const certificateSchema = new mongoose.Schema({
  type: { type: String, enum: ['work', 'study', 'sports', 'other'], default: 'work' },
  daysOff: { type: Number, default: 1 },
  startDate: { type: Date },
  reason: { type: String, default: '' },
  notes: { type: String, default: '' },
  issuedAt: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  diagnosis: { type: String, default: '' },
  findings: { type: String, default: '' },
  recommendations: { type: String, default: '' },
  followUp: { type: String, default: '' },
  issuedAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true, lowercase: true },
  service:   { type: String, required: true },
  doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  reason:    { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'postponed', 'done'],
    default: 'pending'
  },
  // Doctor actions
  postponedDate: { type: Date },
  postponedTime: { type: String },
  postponeReason: { type: String, default: '' },
  cancelReason:   { type: String, default: '' },
  // Documents
  ordonnance:  { type: ordonnanceSchema, default: null },
  certificate: { type: certificateSchema, default: null },
  report:      { type: reportSchema, default: null },

  ticketNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

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