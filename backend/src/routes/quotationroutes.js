// src/routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationcontroller');
const { authMiddleware, requireRole } = require('../middleware/authmiddleware');

// All quotation routes require authentication
router.use(authMiddleware);

// View routes - Admin/CSR/Technician/Finance/HR/Customer can view
router.use(requireRole(['admin', 'csr', 'technician', 'finance', 'hr', 'customer']));

// Get all quotations - all allowed roles can view
router.get('/', quotationController.getQuotations);

// Get quotation by ID - all allowed roles can view
router.get('/:id', quotationController.getQuotationById);

// Create quotation - finance role only
router.post('/', requireRole(['finance']), quotationController.createQuotation);

// Update quotation - finance role only
router.put('/:id', requireRole(['finance']), quotationController.updateQuotation);

// Delete quotation - finance role only
router.delete('/:id', requireRole(['finance']), quotationController.deleteQuotation);

// Generate PDF - all allowed roles can view
router.get('/:id/pdf', quotationController.generateQuotationPDF);

module.exports = router;