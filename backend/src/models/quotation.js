// src/models/Quotation.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
});

const QuotationSchema = new Schema(
  {
    quotationNumber: { type: String, unique: true, sparse: true },
    quotationType: { type: String, enum: ['installation', 'support', 'extension', 'transport', 'other'], default: 'installation' },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    installationType: { type: String, enum: ['fiber', 'wireless'] },
    package: { type: String }, // e.g., '10Mbps'
    otherServices: [ServiceSchema],
    total: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    sentAt: { type: Date },
    acceptedAt: { type: Date },
    notes: { type: String }
  },
  { timestamps: true }
);

// Auto-generate quotation number before save
QuotationSchema.pre('save', async function (next) {
  try {
    // Only generate if this is a new document and quotationNumber is not set
    if (this.isNew && !this.quotationNumber) {
      // Generate a simple incremental number
      const count = await mongoose.model('Quotation').countDocuments();
      const nextNumber = count + 1;
      this.quotationNumber = `QTN-${nextNumber.toString().padStart(4, '0')}`;
      console.log('Generated quotation number:', this.quotationNumber);
    }
    next();
  } catch (err) {
    console.error('Pre-save error for quotation:', err);
    next(err);
  }
});

module.exports = mongoose.model('Quotation', QuotationSchema);
