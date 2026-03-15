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
// Based on user requirements:
// - Super Admin: views all pages but NOT edit (view only)
// - Admin: view all, edit most
// - HR: only edits HR pages (users), views others
// - CRS: view and edit their assigned areas (customers, installations, quotations)
// - Technician: view only technical/installation pages
UserSchema.methods.getPermissions = function () {
  const rolePermissions = {
    superadmin: {
      canView: ['*'], // Can view everything
      canEdit: [], // CANNOT edit anything - VIEW ONLY
      canDelete: [], // CANNOT delete anything
      canCreate: [] // CANNOT create anything
    },
    admin: {
      canView: ['*'], // Can view everything
      canEdit: ['users', 'customers', 'network', 'inventory', 'installations', 'planning', 'quotations', 'invoices', 'reports', 'roles', 'permissions'], // Can edit everything
      canDelete: ['customers', 'network', 'inventory', 'installations', 'planning', 'quotations', 'invoices', 'users'],
      canCreate: ['users', 'customers', 'network', 'inventory', 'installations', 'planning', 'quotations', 'invoices']
    },
    hr: {
      canView: ['*'], // Can view everything
      canEdit: ['users'], // Can only edit users (HR pages)
      canDelete: ['users'], // Can only delete users
      canCreate: ['users'] // Can only create users
    },
    csr: {
      canView: ['customers', 'installations', 'quotations', 'invoices', 'reports', 'planning'],
      canEdit: ['customers', 'installations', 'quotations'], // Can edit their assigned areas
      canDelete: ['quotations'],
      canCreate: ['customers', 'installations', 'quotations']
    },
    technician: {
      canView: ['network', 'customers', 'installations', 'inventory', 'planning'], // Only technical/installation pages
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
