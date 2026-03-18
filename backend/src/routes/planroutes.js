// src/routes/planRoutes.js
const express = require('express');
const router = express.Router();
const planController = require('../controllers/plancontroller');
const { authMiddleware, requireRole } = require('../middleware/authmiddleware');

// All routes require authentication
router.use(authMiddleware);

// Plans CRUD
router.get('/', planController.getPlans);
router.get('/:id', planController.getPlan);
router.post('/', planController.createPlan);
router.put('/:id', planController.updatePlan);
router.delete('/:id', requireRole(['admin']), planController.deletePlan);

// Comments (super admin and admin can add)
router.post('/:id/comments', requireRole(['admin']), planController.addComment);
router.delete('/:id/comments/:commentId', requireRole(['admin']), planController.deleteComment);

// Reports (admin and CSR can access)
router.get('/reports/invoices', requireRole(['admin', 'csr']), planController.getInvoiceReport);
router.get('/reports/customers', requireRole(['admin', 'csr']), planController.getCustomerReport);
router.get('/reports/network', requireRole(['admin', 'csr', 'technician']), planController.getNetworkReport);
router.get('/reports/installations', requireRole(['admin', 'csr']), planController.getInstallationReport);

module.exports = router;
