// src/controllers/quotationController.js
const mongoose = require('mongoose');
const Quotation = require('../models/quotation');
const User = require('../models/user');
const puppeteer = require('puppeteer');

// Get all quotations (admin/csr only)
const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate('customer', 'name email phone location')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get quotation by ID
const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customer', 'name email phone location')
      .populate('createdBy', 'name');
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create quotation
const createQuotation = async (req, res) => {
  try {
    console.log('Creating quotation with data:', req.body);
    console.log('User:', req.user.id);
    const { customer, installationType, package: pkg, otherServices, notes, startDate, endDate } = req.body;

    // Validate required fields
    if (!customer) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }
    if (!installationType) {
      return res.status(400).json({ error: 'Installation type is required' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(customer)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    // Calculate total
    let total = 0;
    // Installation fee - fiber is free, wireless is 4800
    if (installationType === 'fiber') total += 0;
    else if (installationType === 'wireless') total += 4800;

    // Add package price if selected
    if (pkg) {
      const packagePrices = { '10Mbps': 2000, '15Mbps': 2600, '20Mbps': 3900, '30Mbps': 5400 };
      total += packagePrices[pkg] || 0;
    }

    // Add other services
    if (otherServices && Array.isArray(otherServices)) {
      otherServices.forEach(service => total += service.price * (service.quantity || 1));
    }

    const quotation = new Quotation({
      customer,
      installationType,
      package: pkg,
      otherServices: otherServices || [],
      total,
      createdBy: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes
    });

    await quotation.save();
    await quotation.populate('customer', 'name email phone location');
    res.status(201).json(quotation);
  } catch (err) {
    console.error('Error creating quotation:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update quotation
const updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('customer', 'name email phone location');
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete quotation
const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate HTML view/download
const generateQuotationPDF = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customer', 'name email phone location')
      .populate('createdBy', 'name');

    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    if (!quotation.customer) return res.status(400).json({ error: 'Quotation has no associated customer' });

    const html = generateQuotationHTML(quotation);

    res.setHeader('Content-Type', 'text/html');
    const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename=quotation-${quotation.quotationNumber}.html`);
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const generateQuotationHTML = (quotation) => {
  const services = [];
  if (quotation.installationType === 'fiber') services.push({ name: 'Fiber Installation', price: 2000, quantity: 1 });
  else if (quotation.installationType === 'wireless') services.push({ name: 'Wireless Installation', price: 4800, quantity: 1 });

  if (quotation.package) {
    const packagePrices = { '10Mbps': 2000, '15Mbps': 2600, '20Mbps': 3000 };
    services.push({ name: `${quotation.package} Package`, price: packagePrices[quotation.package] || 0, quantity: 1 });
  }

  quotation.otherServices.forEach(s => services.push({ ...s, price: s.price || 0, quantity: s.quantity || 1 }));

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
        <p>Quotation</p>
      </div>
      <div class="details">
        <table>
          <tr><th>Quotation Number:</th><td>${quotation.quotationNumber}</td></tr>
          <tr><th>Date:</th><td>${new Date(quotation.createdAt).toLocaleDateString()}</td></tr>
          <tr><th>Start Date:</th><td>${new Date(quotation.startDate).toLocaleDateString()}</td></tr>
          <tr><th>End Date:</th><td>${new Date(quotation.endDate).toLocaleDateString()}</td></tr>
          <tr><th>Customer:</th><td>${quotation.customer?.name || 'N/A'}</td></tr>
          <tr><th>Email:</th><td>${quotation.customer?.email || 'N/A'}</td></tr>
          <tr><th>Phone:</th><td>${quotation.customer?.phone || 'N/A'}</td></tr>
          <tr><th>Location:</th><td>${quotation.customer?.location || 'N/A'}</td></tr>
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
      <p class="total">Total: KSh ${quotation.total.toLocaleString()}</p>
      ${quotation.notes ? `<p><strong>Notes:</strong> ${quotation.notes}</p>` : ''}
    </body>
    </html>
  `;
};

module.exports = {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  generateQuotationPDF
};