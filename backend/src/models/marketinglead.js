// src/models/MarketingLead.js
const mongoose = require('mongoose');

const MarketingLeadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  plusCode: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  numberOfUnits: { type: Number, default: 0 },
  serviceProviders: { type: String, trim: true, default: '' },
  outreachFeedback: { type: String, trim: true, default: '' },
  prospectDetails: { type: String, trim: true, default: '' },
  contactPerson: { type: String, trim: true, default: '' },
  feedbackNotes: { type: String, trim: true, default: '' },
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'not_interested', 'converted', 'follow_up'],
    default: 'new'
  },
  dateVisited: { type: Date, default: null },
  assignedPersonnel: { type: String, trim: true, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('MarketingLead', MarketingLeadSchema);