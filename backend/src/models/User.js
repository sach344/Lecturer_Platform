const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otpCode: String,
  otpExpiresAt: Date,
  avatar: { type: String, default: '' },
  theme: { type: String, default: 'light' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
