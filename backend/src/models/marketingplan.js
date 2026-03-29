// src/models/MarketingPlan.js
const mongoose = require('mongoose');

const MarketingPlanSchema = new mongoose.Schema({
  weekStartDate: { type: Date, required: true },
  areasPlanned: [{ type: String, trim: true }],
  areasToRevisit: [{ type: String, trim: true }],
  notes: { type: String, trim: true, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('MarketingPlan', MarketingPlanSchema);