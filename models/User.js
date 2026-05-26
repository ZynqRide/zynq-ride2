const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true, lowercase: true, unique: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['rider', 'driver', 'owner'] },
  profilePicture: { type: String, default: null },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approved: { type: Boolean, default: false },
  nationality: { type: String, trim: true, default: 'South African' },
  idNumber: { type: String, trim: true, default: '' },
  licenseType: { type: String, trim: true, default: '' },
  licenseNumber: { type: String, trim: true, default: '' },
  vehicleRegistration: { type: String, trim: true, default: '' },
  vehicleMake: { type: String, trim: true, default: '' },
  vehicleModel: { type: String, trim: true, default: '' },
  vehicleYear: { type: String, trim: true, default: '' },
  vehicleColor: { type: String, trim: true, default: '' },
  vehicleType: { type: String, trim: true, default: '' },
  documents: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    username: this.username,
    email: this.email,
    phone: this.phone,
    role: this.role,
    profilePicture: this.profilePicture,
    verificationStatus: this.verificationStatus,
    approved: this.approved,
    nationality: this.nationality,
    idNumber: this.idNumber,
    licenseType: this.licenseType,
    licenseNumber: this.licenseNumber,
    vehicleRegistration: this.vehicleRegistration,
    vehicleMake: this.vehicleMake,
    vehicleModel: this.vehicleModel,
    vehicleYear: this.vehicleYear,
    vehicleColor: this.vehicleColor,
    vehicleType: this.vehicleType,
    documents: this.documents,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
