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
router.get('/technicians', requireRole(['admin', 'csr']), installationController.getTechnicians);
router.get('/:id', installationController.getInstallationRequest);

// Admin creates installation and assigns to technician
router.post('/admin/create', requireRole(['admin']), installationController.createInstallation);

// Admin assigns technician to installation
router.put('/:id/assign', requireRole(['admin']), installationController.assignTechnician);

// Technician starts installation (marks as in progress)
router.put('/:id/start', requireRole(['technician']), installationController.startInstallation);

// Technician completes installation (with notes/confirmation)
router.put('/:id/complete', requireRole(['technician']), installationController.completeInstallation);

// Admin closes installation (after technician completion)
router.put('/:id/close', requireRole(['admin']), installationController.closeInstallation);

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
