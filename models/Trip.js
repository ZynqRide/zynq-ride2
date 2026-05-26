const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rider: { type: String, trim: true },
  driver: { type: String, trim: true },
  pickup: { type: String, trim: true },
  destination: { type: String, trim: true },
  fare: { type: Number, default: 0 },
  status: { type: String, trim: true, default: 'pending' },
  safetyAlert: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);
