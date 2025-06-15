const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Get transaction summary
router.get('/summary', auth, transactionController.getSummary);

// Get all transactions for the authenticated user
router.get('/', auth, transactionController.getTransactions);

// Create new transaction
router.post('/', auth, transactionController.createTransaction);

// Update transaction
router.put('/:id', auth, transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', auth, transactionController.deleteTransaction);

// Get transaction statistics
router.get('/statistics', auth, transactionController.getStatistics);

module.exports = router; 