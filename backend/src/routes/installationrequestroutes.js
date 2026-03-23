// src/routes/installationRequestRoutes.js
const express = require('express');
const router = express.Router();
const installationController = require('../controllers/installationrequestcontroller');
const { authMiddleware, requireRole } = require('../middleware/authmiddleware');

// All routes require authentication
router.use(authMiddleware);

// Customer can create and view own requests
router.post('/', installationController.createInstallationRequest);
router.get('/my-requests', installationController.getMyRequests);

// Admin/CSR can view all requests and manage
router.get('/', requireRole(['admin', 'csr']), installationController.getInstallationRequests);
router.get('/admin/all', requireRole(['admin']), installationController.getAdminInstallationRequests);
router.get('/procurement', requireRole(['admin', 'procurement']), installationController.getProcurementRequests);
router.get('/finance', requireRole(['admin', 'finance']), installationController.getFinanceRequests);
router.get('/technicians', requireRole(['admin', 'csr']), installationController.getTechnicians);
router.get('/:id', installationController.getInstallationRequest);

// Admin creates installation and assigns to technician
router.post('/admin/create', requireRole(['admin']), installationController.createInstallation);

// Admin sends to procurement (write requirements and tools first)
router.put('/:id/send-to-procurement', requireRole(['admin']), installationController.sendToProcurement);

// Procurement person reviews
router.put('/:id/procurement-review', requireRole(['admin', 'procurement']), installationController.procurementReview);

// Admin sends to finance after procurement approval
router.put('/:id/send-to-finance', requireRole(['admin']), installationController.sendToFinance);

// Finance person reviews
router.put('/:id/finance-review', requireRole(['admin', 'finance']), installationController.financeReview);

// Admin assigns technician to installation (after finance approval)
router.put('/:id/assign', requireRole(['admin']), installationController.assignTechnician);

// Technician starts installation (marks as in progress)
router.put('/:id/start', requireRole(['technician']), installationController.startInstallation);

// Technician completes installation (with notes/confirmation)
router.put('/:id/complete', requireRole(['technician']), installationController.completeInstallation);

// Admin closes installation (after technician completion)
router.put('/:id/close', requireRole(['admin', 'csr']), installationController.closeInstallation);

// Technician can view their assigned installations
router.get('/technician/my-installations', requireRole(['technician']), installationController.getTechnicianInstallations);

// Only CSR/Admin can approve/reject (backward compatibility)
router.put('/:id/approve', requireRole(['admin', 'csr']), installationController.approveRequest);
router.put('/:id/reject', requireRole(['admin', 'csr']), installationController.rejectRequest);

// Create quotation from request
router.post('/:requestId/quotation', requireRole(['admin', 'csr']), installationController.createQuotationFromRequest);

// Delete request
router.delete('/:id', installationController.deleteRequest);

module.exports = router;
