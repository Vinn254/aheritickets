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
      enum: ['customer', 'csr', 'technician', 'admin', 'contractor', 'superadmin', 'hr'],
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

// Get permissions based on role
UserSchema.methods.getPermissions = function () {
  const rolePermissions = {
    superadmin: {
      canView: ['*'],
      canEdit: ['*'],
      canDelete: ['*'],
      canCreate: ['*']
    },
    admin: {
      canView: ['*'],
      canEdit: ['users', 'customers', 'network', 'inventory', 'installations', 'planning', 'quotations', 'invoices', 'reports'],
      canDelete: ['customers', 'network', 'inventory', 'installations', 'planning', 'quotations', 'invoices'],
      canCreate: ['users', 'customers', 'network', 'inventory', 'installations', 'planning', 'quotations', 'invoices']
    },
    hr: {
      canView: ['*'],
      canEdit: ['users', 'invoices', 'receipts', 'reports'],
      canDelete: ['users'],
      canCreate: ['users', 'invoices', 'receipts']
    },
    csr: {
      canView: ['customers', 'installations', 'quotations', 'invoices', 'reports', 'planning'],
      canEdit: ['installations', 'quotations', 'customers'],
      canDelete: ['quotations'],
      canCreate: ['installations', 'quotations', 'customers']
    },
    technician: {
      canView: ['customers', 'installations', 'network', 'inventory', 'planning'],
      canEdit: ['installations', 'network'],
      canDelete: [],
      canCreate: ['installations']
    },
    customer: {
      canView: ['tickets', 'quotations', 'dashboard'],
      canEdit: ['tickets', 'profile'],
      canDelete: ['tickets'],
      canCreate: ['tickets', 'request-installation']
    },
    contractor: {
      canView: ['installations', 'customers', 'planning'],
      canEdit: ['installations'],
      canDelete: [],
      canCreate: ['installations']
    }
  };
  return rolePermissions[this.role] || {};
};

module.exports = mongoose.model('User', UserSchema);
