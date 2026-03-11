// backend/src/models/pop.js
const mongoose = require('mongoose');

const PopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    macAddress: { type: String, trim: true, default: '' },
    details: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'down'], default: 'active' },
    lastSeen: { type: Date, default: Date.now },
    aps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AP' }],
    backbones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Backbone' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('POP', PopSchema);