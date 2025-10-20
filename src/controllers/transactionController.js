import transactionModel from '../models/transactionModel.js';
import customerModel from '../models/customerModel.js';

const transactionController = {
  createTransaction: async (req, res) => {
    const transactionData = req.body;
    const { customer_id} = req.body;

    try {
      console.log('TRANSACTION DATA:', transactionData);
      const newTransaction = await transactionModel.createTransaction(transactionData);
      req.flash('success_msg', 'Transacción creada exitosamente');
      res.redirect('/customers/'+ customer_id +'/transactions');
    } catch (err) {
      res.status(500).json({ error: 'Error al crear la transacción' });
    }
  },
  showTransactionForm: async (req, res) => {
    //const customerId = req.params.customerId;
    try {
      //const customer = await customerModel.getCustomerById(customerId);
      //const transactions = await transactionModel.getTransactionsByCustomerId(customerId);
      //const balance = await transactionModel.getCustomerBalance(customerId);
      res.render('transactions', { title: 'Transacciones' });
    //: { id: customerId }
    } catch (err) {
      res.status(500).send('Error al cargar las transacciones');
    }
  },
  showTransactionHistory: async (req, res) => {
    const customerId = Number(req.query.customer_id);
    try {
      const customer = await customerModel.getCustomerById(customerId);
      const transactions = await transactionModel.getTransactionsByCustomerId(customerId);
      const balance = await transactionModel.getCustomerBalance(customerId);
      res.render('transactionHistory', { title: 'Historial de Transacciones', customer, transactions, balance });
    } catch (err) {
      res.status(500).send('Error al cargar el historial de transacciones');
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