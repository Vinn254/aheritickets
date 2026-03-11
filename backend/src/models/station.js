// backend/src/models/station.js
const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    details: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' }, // IP address
    macAddress: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'down'], default: 'active' },
    lastSeen: { type: Date, default: Date.now },
    ap: { type: mongoose.Schema.Types.ObjectId, ref: 'AP', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Station', StationSchema);