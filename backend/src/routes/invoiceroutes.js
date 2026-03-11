// src/routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoicecontroller');
const { authMiddleware, requireRole } = require('../middleware/authmiddleware');

// All invoice routes require authentication
router.use(authMiddleware);

// Admin/CSR/Technician for invoices
router.use(requireRole(['admin', 'csr', 'technician']));

// Get all invoices
router.get('/', invoiceController.getInvoices);

// Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// Create invoice from quotation
router.post('/', invoiceController.createInvoiceFromQuotation);

// Update invoice
router.put('/:id', invoiceController.updateInvoice);

// Delete invoice
router.delete('/:id', invoiceController.deleteInvoice);

// Generate PDF
router.get('/:id/pdf', invoiceController.generateInvoicePDF);

module.exports = router;