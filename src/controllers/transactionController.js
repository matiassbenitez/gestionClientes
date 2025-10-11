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
      const balance = await transactionModel.getCustomerBalance(customerId);
      res.render('transactions', { title: 'Transacciones', customer: { id: customerId }, transactions: transactions, balance: balance });
    } catch (err) {
      res.status(500).send('Error al cargar las transacciones');
    }
  },
  getAnnualReport: async (req, res) => {
    const year = parseInt(req.params.year, 10);
    try {
      const report = await transactionModel.getAnnualReport(year);
      console.log("Annual report data:", report);
      res.render('chartAnnual', { title: `Informe Anual ${year}`, chartData:report });
      //res.json(report);
    } catch (err) {
      res.status(500).json({ error: 'Error al generar el informe anual' });
    }
  }
};

export default transactionController;