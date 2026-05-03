const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const availabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  slotDurationMinutes: { type: Number, default: 30 }
});

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  specialty: { type: String, required: true, trim: true },
  bio:       { type: String, default: '' },
  phone:     { type: String, default: '' },
  email:     { type: String, default: '', unique: true, sparse: true },
  photo:     { type: String, default: '' },
  availability: [availabilitySlotSchema],
  isActive:  { type: Boolean, default: true },
  // Auth fields
  password:  { type: String, default: '' },
  tempPassword: { type: String, default: '' }, // store plain for first-login display
  createdAt: { type: Date, default: Date.now }
});

doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

doctorSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);