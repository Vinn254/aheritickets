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

router.use(auth);

router.get('/', getReceipts);
router.get('/:id', getReceiptById);
router.post('/', createReceipt);
router.delete('/:id', deleteReceipt);

module.exports = router;