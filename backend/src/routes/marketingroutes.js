// src/routes/marketingroutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authmiddleware');
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

router.use(authMiddleware);

// Marketing Leads routes
router.get('/leads', requireRole(['admin', 'superadmin', 'hr', 'csr']), listLeads);
router.get('/leads/:id', requireRole(['admin', 'superadmin', 'hr', 'csr']), getLead);
router.post('/leads', requireRole(['admin', 'superadmin', 'csr']), createLead);
router.put('/leads/:id', requireRole(['admin', 'superadmin', 'csr']), updateLead);
router.delete('/leads/:id', requireRole(['admin', 'superadmin']), deleteLead);

// Marketing Plans routes
router.get('/plans', requireRole(['admin', 'superadmin', 'hr', 'csr']), listPlans);
router.get('/plans/:id', requireRole(['admin', 'superadmin', 'hr', 'csr']), getPlan);
router.post('/plans', requireRole(['admin', 'superadmin', 'csr']), createPlan);
router.put('/plans/:id', requireRole(['admin', 'superadmin', 'csr']), updatePlan);
router.delete('/plans/:id', requireRole(['admin', 'superadmin']), deletePlan);

module.exports = router;