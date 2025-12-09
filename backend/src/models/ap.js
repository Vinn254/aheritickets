ice type // backend/src/models/ap.js
const mongoose = require('mongoose');

const ApSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    macAddress: { type: String, trim: true, default: '' },
    details: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'down'], default: 'active' },
    lastSeen: { type: Date, default: Date.now },
    pop: { type: mongoose.Schema.Types.ObjectId, ref: 'POP', required: true },
    stations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Station' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AP', ApSchema);