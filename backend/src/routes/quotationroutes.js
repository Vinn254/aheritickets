// src/routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationcontroller');
const { authMiddleware, requireRole } = require('../middleware/authmiddleware');

// All quotation routes require authentication
router.use(authMiddleware);

// Get all quotations - Admin/CSR/Technician/Customer
router.get('/', quotationController.getQuotations);

// Get quotation by ID - Admin/CSR/Technician/Customer
router.get('/:id', quotationController.getQuotationById);

// Create quotation - Admin/CSR/Technician only
router.post('/', requireRole(['admin', 'csr', 'technician']), quotationController.createQuotation);

// Update quotation - Admin/CSR/Technician only
router.put('/:id', requireRole(['admin', 'csr', 'technician']), quotationController.updateQuotation);

// Delete quotation - Admin/CSR/Technician only
router.delete('/:id', requireRole(['admin', 'csr', 'technician']), quotationController.deleteQuotation);

// Generate PDF - Admin/CSR/Technician/Customer
router.get('/:id/pdf', quotationController.generateQuotationPDF);

module.exports = router;