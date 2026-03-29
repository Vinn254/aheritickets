// src/routes/marketingroutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authmiddleware');
const {
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/marketingcontroller');

// Marketing Leads routes
router.get('/leads', protect, authorize('admin', 'superadmin', 'hr', 'csr'), listLeads);
router.get('/leads/:id', protect, authorize('admin', 'superadmin', 'hr', 'csr'), getLead);
router.post('/leads', protect, authorize('admin', 'superadmin', 'csr'), createLead);
router.put('/leads/:id', protect, authorize('admin', 'superadmin', 'csr'), updateLead);
router.delete('/leads/:id', protect, authorize('admin', 'superadmin'), deleteLead);

// Marketing Plans routes
router.get('/plans', protect, authorize('admin', 'superadmin', 'hr', 'csr'), listPlans);
router.get('/plans/:id', protect, authorize('admin', 'superadmin', 'hr', 'csr'), getPlan);
router.post('/plans', protect, authorize('admin', 'superadmin', 'csr'), createPlan);
router.put('/plans/:id', protect, authorize('admin', 'superadmin', 'csr'), updatePlan);
router.delete('/plans/:id', protect, authorize('admin', 'superadmin'), deletePlan);

module.exports = router;