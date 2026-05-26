const mongoose = require('mongoose');

const safetyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  type: { type: String, trim: true, required: true },
  description: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SafetyLog', safetyLogSchema);
