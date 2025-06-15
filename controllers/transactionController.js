const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// Get transaction summary
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all transactions for the user
    const transactions = await Transaction.find({ user: userId })
      .populate('category')
      .sort({ date: -1 });

    if (!transactions) {
      return res.json({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        recentTransactions: [],
        monthlyData: [],
        categoryData: [],
      });
    }

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const balance = totalIncome - totalExpenses;

    // Get recent transactions
    const recentTransactions = transactions.slice(0, 5);

    // Get monthly data for the last 6 months
    const monthlyData = [];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthTransactions = transactions.filter(t => {
        if (!t.date) return false;
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      monthlyData.push({
        month: months[month],
        income: monthIncome,
        expenses: monthExpenses,
        balance: monthIncome - monthExpenses,
      });
    }

    // Get category distribution
    const categoryData = [];
    const categories = await Category.find({ user: userId });

    for (const category of categories) {
      const categoryTransactions = transactions.filter(
        t => t.category && t.category._id && t.category._id.toString() === category._id.toString()
      );

      const categoryAmount = categoryTransactions.reduce(
        (sum, t) => sum + (t.type === 'expense' ? Number(t.amount || 0) : 0),
        0
      );

      if (categoryAmount > 0) {
        categoryData.push({
          name: category.name,
          amount: categoryAmount,
        });
      }
    }

    res.json({
      totalIncome,
      totalExpenses,
      balance,
      recentTransactions,
      monthlyData,
      categoryData,
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ 
      message: 'Error al obtener el resumen',
      error: error.message 
    });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('category')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las transacciones' });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    // Validate required fields
    if (!description || !amount || !type || !category || !date) {
      return res.status(400).json({ 
        message: 'Todos los campos son obligatorios' 
      });
    }

    // Validate category exists
    const categoryExists = await Category.findOne({ 
      _id: category,
      user: req.user._id 
    });

    if (!categoryExists) {
      return res.status(400).json({ 
        message: 'La categoría seleccionada no existe' 
      });
    }

    // Validate amount is positive
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ 
        message: 'El monto debe ser un número positivo' 
      });
    }

    const transaction = new Transaction({
      description,
      amount: numericAmount,
      type,
      category,
      date,
      user: req.user._id,
    });

    await transaction.save();
    
    // Populate category before sending response
    await transaction.populate('category');
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ 
      message: 'Error al crear la transacción',
      error: error.message 
    });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { 
        description, 
        amount: Number(amount), 
        type, 
        category, 
        date 
      },
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la transacción' });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }
    res.json({ message: 'Transacción eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la transacción' });
  }
};

// Get transaction statistics
exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(query).populate('category');

    const statistics = {
      totalIncome: 0,
      totalExpense: 0,
      byCategory: {}
    };

    transactions.forEach(transaction => {
      const amount = Number(transaction.amount || 0);
      const categoryName = transaction.category ? transaction.category.name : 'Sin categoría';

      if (transaction.type === 'income') {
        statistics.totalIncome += amount;
      } else {
        statistics.totalExpense += amount;
      }

      if (!statistics.byCategory[categoryName]) {
        statistics.byCategory[categoryName] = {
          income: 0,
          expense: 0
        };
      }

      if (transaction.type === 'income') {
        statistics.byCategory[categoryName].income += amount;
      } else {
        statistics.byCategory[categoryName].expense += amount;
      }
    });

    res.json(statistics);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      message: 'Error al obtener las estadísticas',
      error: error.message 
    });
  }
}; 