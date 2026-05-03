const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctor-auth', require('./routes/doctor-auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/doctor-appointments', require('./routes/doctor-appointments'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/doctors', require('./routes/doctors'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (no DB)`));
  });

module.exports = app;