// src/controllers/invoiceController.js
const Invoice = require('../models/invoice');
const Quotation = require('../models/quotation');
const puppeteer = require('puppeteer');

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name email phone location')
      .populate('createdBy', 'name')
      .populate('quotation', 'quotationNumber')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone location')
      .populate('createdBy', 'name')
      .populate('quotation', 'quotationNumber');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create invoice from quotation
const createInvoiceFromQuotation = async (req, res) => {
  try {
    const { quotationId, dueDate, notes } = req.body;

    if (!dueDate || isNaN(new Date(dueDate).getTime())) return res.status(400).json({ error: 'Invalid due date' });

    const quotation = await Quotation.findById(quotationId).populate('customer');
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    if (!quotation.customer) return res.status(400).json({ error: 'Quotation has no associated customer' });

    const invoice = new Invoice({
      quotation: quotationId,
      customer: quotation.customer._id,
      installationType: quotation.installationType,
      package: quotation.package,
      otherServices: quotation.otherServices.map(s => ({ ...s, price: s.price || 0, quantity: s.quantity || 1 })),
      total: parseFloat(quotation.total) || 0,
      dueDate: new Date(dueDate),
      createdBy: req.user.id,
      notes
    });

    await invoice.save();
    await invoice.populate('customer', 'name email phone location');
    await invoice.populate('quotation', 'quotationNumber');
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    // If status is being updated to 'paid', automatically set paidAt date
    const updateData = { ...req.body };
    if (updateData.status === 'paid') {
      updateData.paidAt = new Date();
    } else if (updateData.status !== 'paid') {
      // If changing from paid to unpaid/overdue, clear paidAt
      updateData.paidAt = null;
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('customer', 'name email phone location')
      .populate('quotation', 'quotationNumber');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });

  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate HTML view/download
const generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone location')
      .populate('createdBy', 'name')
      .populate('quotation', 'quotationNumber');

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (!invoice.customer) return res.status(400).json({ error: 'Invoice has no associated customer' });

    const html = generateInvoiceHTML(invoice);

    res.setHeader('Content-Type', 'text/html');
    const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename=invoice-${invoice.invoiceNumber}.html`);
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const generateInvoiceHTML = (invoice) => {
  const services = [];
  // Installation fee - fiber is free, wireless is 4800
  if (invoice.installationType === 'fiber') services.push({ name: 'Fiber Installation', price: 0, quantity: 1 });
  else if (invoice.installationType === 'wireless') services.push({ name: 'Wireless Installation', price: 4800, quantity: 1 });

  if (invoice.package) {
    const packagePrices = { '10Mbps': 2000, '15Mbps': 2600, '20Mbps': 3900, '30Mbps': 5400 };
    services.push({ name: `${invoice.package} Package`, price: packagePrices[invoice.package] || 0, quantity: 1 });
  }

  invoice.otherServices.forEach(s => services.push({ ...s, price: s.price || 0, quantity: s.quantity || 1 }));

  const servicesHTML = services.map(s => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${s.name}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${s.quantity}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">KSh ${s.price.toLocaleString()}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">KSh ${(s.price * s.quantity).toLocaleString()}</td></tr>`).join('');

  return `
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; position: relative; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #43e97b; padding-bottom: 20px; }
        .header h1 { color: #2d7a3e; margin: 0; font-size: 36px; }
        .header p { color: #666; margin: 5px 0; font-size: 18px; }
        .details { margin-bottom: 20px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .details table { width: 100%; border-collapse: collapse; }
        .details th, .details td { border: 1px solid #ddd; padding: 10px; text-align: left; font-weight: bold; color: black; }
        .details th { background: #e9ecef; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border: 1px solid #ddd; padding: 12px; text-align: left; }
        td { border: 1px solid #ddd; padding: 12px; }
        .total { font-weight: bold; font-size: 20px; text-align: right; color: #2d7a3e; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(0,0,0,0.05); z-index: -1; pointer-events: none; }
      </style>
    </head>
    <body>
      <div class="watermark">AheriNetworks</div>
      <div class="header">
        <h1>AheriNET</h1>
        <p>Invoice</p>
      </div>
      <div class="details">
        <table>
          <tr><th>Invoice Number:</th><td>${invoice.invoiceNumber}</td></tr>
          <tr><th>Quotation Number:</th><td>${invoice.quotation?.quotationNumber || 'N/A'}</td></tr>
          <tr><th>Date:</th><td>${new Date(invoice.createdAt).toLocaleDateString()}</td></tr>
          <tr><th>Due Date:</th><td>${new Date(invoice.dueDate).toLocaleDateString()}</td></tr>
          <tr><th>Customer:</th><td>${invoice.customer?.name || 'N/A'}</td></tr>
          <tr><th>Email:</th><td>${invoice.customer?.email || 'N/A'}</td></tr>
          <tr><th>Phone:</th><td>${invoice.customer?.phone || 'N/A'}</td></tr>
          <tr><th>Location:</th><td>${invoice.customer?.location || 'N/A'}</td></tr>
        </table>
      </div>
      <table>
        <thead>
          <tr><th>Service</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Unit Price</th><th style="text-align: right;">Total</th></tr>
        </thead>
        <tbody>
          ${servicesHTML}
        </tbody>
      </table>
      <p class="total">Total: KSh ${invoice.total.toLocaleString()}</p>
      ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
    </body>
    </html>
  `;
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoiceFromQuotation,
  updateInvoice,
  deleteInvoice,
  generateInvoicePDF
};