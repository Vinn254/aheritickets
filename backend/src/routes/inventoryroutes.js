// backend/src/routes/inventoryroutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventorycontroller');
const { authMiddleware } = require('../middleware/authmiddleware');

// All inventory routes require authentication
router.use(authMiddleware);

// Create inventory item
router.post('/', inventoryController.createInventory);

// Get all inventory items with filters
router.get('/', inventoryController.getInventory);

// Get inventory counts
router.get('/counts', inventoryController.getInventoryCounts);

// Get single inventory item by id
router.get('/:id', inventoryController.getInventoryById);

// Update inventory item
router.put('/:id', inventoryController.updateInventory);

// Delete inventory item
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;