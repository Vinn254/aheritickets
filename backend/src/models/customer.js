// src/models/Customer.js
const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  contact: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  connectionType: {
    type: String,
    required: true,
    enum: ['fiber', 'wireless'],
    default: 'wireless'
  },
  packageStatus: {
    type: String,
    required: true,
    enum: ['active', 'dormant', 'deactive'],
    default: 'active'
  },
  location: { type: String, trim: true, default: '' }, // Plus code location
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
