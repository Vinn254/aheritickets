// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    specialization: { type: String, trim: true, default: '' }, // for technicians/contractors
    deviceType: { type: String, trim: true, default: '' }, // for customers
    // New customer fields
    firstName: { type: String, trim: true, default: '' },
    otherNames: { type: String, trim: true, default: '' },
    accountNumber: { type: String, trim: true, default: '' },
    customerSegment: { type: String, trim: true, default: '' }, // POP
    serviceType: { type: String, trim: true, default: '' },
    routerMacAddress: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' }, // Customer location
    billingPlan: { type: String, trim: true, default: '' }, // Billing plan for customers
    station: { type: String, trim: true, default: '' }, // Station for customers
    ipAddress: { type: String, trim: true, default: '' }, // IP Address for customers
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'csr', 'technician', 'admin', 'contractor'],
      default: 'customer'
    },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'dormant', 'deactive'], default: 'active' }, // Customer status
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare provided password with stored hash
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Generate password reset token
UserSchema.methods.createPasswordResetToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

// Hide password when returning user as JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
