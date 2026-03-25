// backend/src/routes/receiptroutes.js
const express = require('express');
const router = express.Router();
const { 
  getReceipts, 
  getReceiptById, 
  createReceipt, 
  deleteReceipt 
} = require('../controllers/receiptcontroller');
const auth = require('../middleware/authmiddleware');

const { authMiddleware } = auth;

router.use(authMiddleware);

router.get('/', getReceipts);
router.get('/:id', getReceiptById);
router.post('/', createReceipt);
router.delete('/:id', deleteReceipt);

module.exports = router;