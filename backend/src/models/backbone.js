// backend/src/models/backbone.js
const mongoose = require('mongoose');

const BackboneSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['wireless', 'fibre'], required: true },
    details: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'down'], default: 'active' },
    lastSeen: { type: Date, default: Date.now },
    pops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'POP' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Backbone', BackboneSchema);