// src/models/Invoice.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
});

const InvoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, unique: true, sparse: true },
    quotation: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    installationType: { type: String, enum: ['fiber', 'wireless'], required: true },
    package: { type: String },
    otherServices: [ServiceSchema],
    total: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    payments: [{ type: Schema.Types.ObjectId, ref: 'Receipt' }],
    status: { type: String, enum: ['unpaid', 'partial', 'paid', 'overdue'], default: 'unpaid' },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String }
  },
  { timestamps: true }
);

// Auto-generate invoice number before save
InvoiceSchema.pre('save', async function (next) {
  try {
    if (this.isNew && !this.invoiceNumber) {
      const lastInvoice = await mongoose.model('Invoice').findOne({}, {}, { sort: { 'createdAt': -1 } });
      let nextNumber = 1;
      if (lastInvoice && lastInvoice.invoiceNumber) {
        const matches = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
        if (matches && matches[1]) {
          nextNumber = parseInt(matches[1]) + 1;
        }
      }
      this.invoiceNumber = `INV-${nextNumber.toString().padStart(5, '0')}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);