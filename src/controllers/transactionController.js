import transactionModel from '../models/transactionModel.js';

const transactionController = {
  createTransaction: async (req, res) => {
    const transactionData = req.body;

    try {
      console.log('TRANSACTION DATA:', transactionData);
      const newTransaction = await transactionModel.createTransaction(transactionData);
      
      req.flash('success_msg', 'Transacción creada exitosamente');
      res.redirect('/customers/' + transactionData.customer_id + '/transactions');
    } catch (err) {
      res.status(500).json({ error: 'Error al crear la transacción' });
    }
  },
  showTransactionForm: async (req, res) => {
    const customerId = req.params.customerId;
    try {
      const transactions = await transactionModel.getTransactionsByCustomerId(customerId);
      res.render('transactions', { title: 'Transacciones', customer: { id: customerId }, transactions: transactions });
    } catch (err) {
      res.status(500).send('Error al cargar las transacciones');
    }
  }
};

export default transactionController;