const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Get transaction summary
router.get('/summary', auth, transactionController.getSummary);

// Get all transactions
router.get('/', auth, transactionController.getTransactions);

// Create transaction
router.post('/', auth, transactionController.createTransaction);

// Update transaction
router.put('/:id', auth, transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', auth, transactionController.deleteTransaction);

module.exports = router; 