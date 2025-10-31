import pool from "../config/db.js";
import transactionController from "./transactionController.js";
import transactionModel from "../models/transactionModel.js";
import customerModel from "../models/customerModel.js";

const apiController = {
  searchCustomers: async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 1) {
      console.log("Query too short or missing:", query);
      return res.json([]);
    } else {
      try {
        const [rows] = await pool.query(
          'SELECT id, name FROM customer WHERE (name LIKE ? OR id LIKE ?) AND is_deleted = FALSE LIMIT 10',
          [`%${query}%`, `${query}%`]
        );
        console.log("Search results for query", query, ":", rows);
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: 'Error searching customers' });
      }
    }
  },
  getCustomerBalance: async (req, res) => {
    try {
      const customerId = Number(req.params.customerId);
      if (!customerId) {
        return res.status(400).json({ error: 'customerId is required' });
      }
      const balance = await transactionController.getCustomerBalance(customerId);
      res.json({ balance });
    } catch (err) {
      res.status(500).json({ error: 'Error retrieving customer balance' });
    }
  },
  getCustomerTransactionDataJSON: async (req, res, next) => {
    const customerId = Number(req.params.customerId);
    const { startDate, endDate } = req.query;
    try {
      const customer = await customerModel.getCustomerById(customerId);
      let transactions = [];
      let initialBalance = 0;
      let finalBalance = 0;
      if (startDate && endDate) {
        transactions = await transactionModel.getTransactionsByCustomerIdAndDateRange(customerId, startDate, endDate);
        initialBalance = await transactionModel.getInitialBalance(customerId, startDate);
        finalBalance = await transactionModel.getFinalBalance(customerId, endDate);
      } else {
        transactions = await transactionModel.getTransactionsByCustomerId(customerId);
        finalBalance = await transactionModel.getFinalBalance(customerId, new Date().toISOString().split('T')[0]);
      }
      console.log('Transaction 1: ', transactions[0]);
      const data = { 
        customer, 
        transactions, 
        initialBalance, 
        finalBalance,
        startDate,
        endDate};
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  },
  getCustomerTransactionData: async (customerId, startDate, endDate) => {
    try {
      const customer = await customerModel.getCustomerById(customerId);
      let transactions = [];
      let initialBalance = 0;
      let finalBalance = 0;
      if (startDate && endDate) {
        transactions = await transactionModel.getTransactionsByCustomerIdAndDateRange(customerId, startDate, endDate);
        initialBalance = await transactionModel.getInitialBalance(customerId, startDate);
        finalBalance = await transactionModel.getFinalBalance(customerId, endDate);
      } else {
        transactions = await transactionModel.getTransactionsByCustomerId(customerId);
        finalBalance = await transactionModel.getFinalBalance(customerId, new Date().toISOString().split('T')[0]);
      }
      return { 
        customer, 
        transactions, 
        initialBalance, 
        finalBalance,
        startDate,
        endDate};
    } catch (err) {
      throw err;  
  }
  }
};

export default apiController;