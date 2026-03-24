// backend/src/controllers/receiptcontroller.js
const Receipt = require('../models/receipt');
const Invoice = require('../models/invoice');

// Get all receipts
const getReceipts = async (req, res) => {
  try {
    // Allow finance, admin, csr roles
    if (!['finance', 'admin', 'csr'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Only finance, admin, or CSR can view receipts' });
    }

    const receipts = await Receipt.find()
      .populate('invoice', 'invoiceNumber total')
      .populate('customer', 'name email phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single receipt
const getReceiptById = async (req, res) => {
  try {
    if (!['finance', 'admin', 'csr'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Only finance, admin, or CSR can view receipts' });
    }

    const receipt = await Receipt.findById(req.params.id)
      .populate('invoice')
      .populate('customer', 'name email phone location')
      .populate('createdBy', 'name');
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create receipt
const createReceipt = async (req, res) => {
  try {
    // Only finance can create receipts
    if (!['finance', 'csr'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Only finance or CSR can create receipts' });
    }

    const { invoice: invoiceId, amount, paymentMethod, referenceNumber, paymentDate, notes, customer } = req.body;

    if (!invoiceId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Invoice, amount, and payment method are required' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Create receipt
    const receipt = new Receipt({
      invoice: invoiceId,
      customer: customer || invoice.customer,
      amount: parseFloat(amount),
      paymentMethod,
      referenceNumber,
      paymentDate: paymentDate || new Date(),
      notes,
      createdBy: req.user.id
    });

    await receipt.save();

    // Update invoice - add payment and check if fully paid
    const currentPaid = invoice.paidAmount || 0;
    const newPaid = currentPaid + parseFloat(amount);
    
    let invoiceStatus = invoice.status;
    if (newPaid >= invoice.total) {
      invoiceStatus = 'paid';
    } else if (newPaid > 0) {
      invoiceStatus = 'partial';
    }

    await Invoice.findByIdAndUpdate(invoiceId, {
      $push: { payments: receipt._id },
      $set: { 
        paidAmount: newPaid,
        status: invoiceStatus,
        paidAt: invoiceStatus === 'paid' ? new Date() : null
      }
    });

    await receipt.populate('invoice', 'invoiceNumber total');
    await receipt.populate('customer', 'name email phone');

    res.status(201).json(receipt);
  } catch (err) {
    console.error('Error creating receipt:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete receipt
const deleteReceipt = async (req, res) => {
  try {
    // Only finance can delete receipts
    if (req.user.role !== 'finance') {
      return res.status(403).json({ error: 'Forbidden: Only finance can delete receipts' });
    }

    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    // Update invoice to reverse the payment
    const invoice = await Invoice.findById(receipt.invoice);
    if (invoice) {
      const newPaid = (invoice.paidAmount || 0) - receipt.amount;
      let newStatus = 'unpaid';
      if (newPaid >= invoice.total) {
        newStatus = 'paid';
      } else if (newPaid > 0) {
        newStatus = 'partial';
      }

      await Invoice.findByIdAndUpdate(receipt.invoice, {
        $pull: { payments: receipt._id },
        $set: { 
          paidAmount: Math.max(0, newPaid),
          status: newStatus,
          paidAt: newStatus === 'paid' ? new Date() : null
        }
      });
    }

    await Receipt.findByIdAndDelete(req.params.id);
    res.json({ message: 'Receipt deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getReceipts,
  getReceiptById,
  createReceipt,
  deleteReceipt
};