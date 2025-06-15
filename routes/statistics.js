const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Get statistics for a specific time range
router.get('/', auth, async (req, res) => {
    try {
        const { timeRange } = req.query;
        const userId = req.user.id;

        // Calculate date range based on timeRange
        const now = new Date();
        let startDate;
        switch (timeRange) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setMonth(now.getMonth() - 1)); // Default to last month
        }

        // Get all transactions for the user within the date range
        const transactions = await Transaction.find({
            user: userId,
            date: { $gte: startDate }
        }).populate('category');

        // Calculate statistics
        const stats = {
            totalIncome: 0,
            totalExpense: 0,
            byCategory: {}
        };

        transactions.forEach(transaction => {
            const amount = transaction.amount;
            const categoryName = transaction.category.name;

            if (transaction.type === 'income') {
                stats.totalIncome += amount;
            } else {
                stats.totalExpense += amount;
            }

            if (!stats.byCategory[categoryName]) {
                stats.byCategory[categoryName] = {
                    income: 0,
                    expense: 0
                };
            }

            if (transaction.type === 'income') {
                stats.byCategory[categoryName].income += amount;
            } else {
                stats.byCategory[categoryName].expense += amount;
            }
        });

        res.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

module.exports = router; 