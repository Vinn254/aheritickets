// backend/src/models/receipt.js
const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'bank', 'cash', 'cheque'],
    required: true
  },
  referenceNumber: {
    type: String
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Auto-generate receipt number
receiptSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model('Receipt').countDocuments();
    this.receiptNumber = `RCP-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Receipt', receiptSchema);