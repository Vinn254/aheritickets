// src/routes/customersRoutes.js
const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customerscontroller');
const { authMiddleware, requireRole } = require('../middleware/authmiddleware');

// All routes require authentication
router.use(authMiddleware);

// Admin and technician can list, create, and update customers
router.get('/', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'technician') {
    return customersController.listCustomers(req, res, next);
  }
  return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
});

router.get('/:id', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'technician') {
    return customersController.getCustomer(req, res, next);
  }
  return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
});

// Admin and technician can create customers
router.post('/', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'technician') {
    return customersController.createCustomer(req, res, next);
  }
  return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
});

// Admin and technician can update customers
router.put('/:id', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'technician') {
    return customersController.updateCustomer(req, res, next);
  }
  return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
});

// Only admin can delete customers
router.delete('/:id', requireRole(['admin']), customersController.deleteCustomer);

module.exports = router;
