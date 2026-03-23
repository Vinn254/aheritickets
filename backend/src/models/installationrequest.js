// src/models/InstallationRequest.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const InstallationRequestSchema = new Schema(
  {
    requestNumber: { type: String, unique: true, sparse: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    installationType: { type: String, enum: ['fiber', 'wireless'], required: true },
    package: { type: String, required: true }, // e.g., '10Mbps', '15Mbps', '20Mbps'
    packagePrice: { type: Number, default: 0 }, // Monthly package price
    installationFee: { type: Number, default: 0 }, // One-time installation fee
    includeRouter: { type: Boolean, default: false }, // Whether router is included
    routerPrice: { type: Number, default: 0 }, // Router cost if included
    totalUpfront: { type: Number, default: 0 }, // Total upfront payment (installation + router)
    location: { type: String },
    description: { type: String },
    // Requirements and tools - written by admin
    requirements: { type: String }, // All requirements written by admin
    tools: { type: String }, // Tools needed
    // New status workflow for procurement/finance flow:
    // opened (admin creates) -> pending_procurement (sent to procurement) -> pending_finance (sent to finance) -> pending_technician (assigned) -> pending (in progress) -> completed -> closed
    status: { 
      type: String, 
      enum: [
        'opened', 
        'pending_procurement', 
        'procurement_approved',
        'pending_finance', 
        'finance_approved',
        'pending_technician', 
        'pending', 
        'completed', 
        'closed',
        'rejected_procurement',
        'rejected_finance'
      ], 
      default: 'opened' 
    },
    // Procurement stage
    procurementReview: {
      requiredItems: { type: String }, // What procurement person writes as required items
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
      reviewNotes: { type: String },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    // Finance stage
    financeReview: {
      approvedAmount: { type: Number, default: 0 },
      budgetCode: { type: String },
      financeApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      financeApprovedAt: { type: Date },
      financeNotes: { type: String },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    // Technician assignment
    technician: { type: Schema.Types.ObjectId, ref: 'User' },
    technicianNotes: { type: String }, // Notes from technician when marking as completed
    adminConfirmationNotes: { type: String }, // Notes from admin when closing installation
    completionDate: { type: Date }, // When technician marked as completed
    closedDate: { type: Date }, // When admin closed the installation
    // Keep old fields for backward compatibility
    quotation: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalNotes: { type: String },
    requestedDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Auto-generate request number before save
InstallationRequestSchema.pre('save', async function (next) {
  try {
    if (this.isNew && !this.requestNumber) {
      const count = await mongoose.model('InstallationRequest').countDocuments();
      const nextNumber = count + 1;
      this.requestNumber = `INST-${nextNumber.toString().padStart(5, '0')}`;
    }
    next();
  } catch (err) {
    console.error('Pre-save error for installation request:', err);
    next(err);
  }
});

module.exports = mongoose.model('InstallationRequest', InstallationRequestSchema);
