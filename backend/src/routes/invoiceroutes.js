// backend/src/routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoicecontroller');
const { authMiddleware, requireRole } = require('../middleware/authmiddleware');

// All invoice routes require authentication
router.use(authMiddleware);

// View routes - admin, csr, technician, finance, hr can view
router.use(requireRole(['admin', 'csr', 'technician', 'finance', 'hr']));

// Get all invoices - all allowed roles can view
router.get('/', invoiceController.getInvoices);

// Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// Create invoice from quotation - finance role only
router.post('/', requireRole(['finance']), invoiceController.createInvoiceFromQuotation);

// Update invoice - finance role only
router.put('/:id', requireRole(['finance']), invoiceController.updateInvoice);

// Delete invoice - finance role only
router.delete('/:id', requireRole(['finance']), invoiceController.deleteInvoice);

// Generate PDF
router.get('/:id/pdf', invoiceController.generateInvoicePDF);

module.exports = router;