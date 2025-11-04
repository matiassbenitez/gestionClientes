import pool from "../config/db.js";
import transactionController from "./transactionController.js";
import transactionService from "../services/transactionService.js";
import customerService from "../services/customerService.js";

const apiController = {
  searchCustomers: async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 1) {
      console.log("Query too short or missing:", query);
      return res.json([]);
    } else {
      try {
        const rows = await customerService.searchCustomers(query);
        console.log("Search results for query", query, ":", rows);
        return res.json(rows);
      } catch (err) {
        console.error('Error searching customers:', err);
        return res.status(500).json({ error: 'Error searching customers' });
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
      const customer = await customerService.getCustomerById(customerId);
      let transactions = [];
      let initialBalance = 0;
      let finalBalance = 0;
      if (startDate && endDate) {
        transactions = await transactionService.getTransactionsByDateRange(customerId, startDate, endDate);
        initialBalance = await transactionService.getInitialBalance(customerId, startDate);
        finalBalance = await transactionService.getFinalBalance(customerId, endDate);
      } else {
        transactions = await transactionService.getTransactionsByCustomerId(customerId);
        finalBalance = await transactionService.getFinalBalance(customerId, new Date().toISOString().split('T')[0]);
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
      const customer = await customerService.getCustomerById(customerId);
      let transactions = [];
      let initialBalance = 0;
      let finalBalance = 0;
      if (startDate && endDate) {
        transactions = await transactionService.getTransactionsByDateRange(customerId, startDate, endDate);
        initialBalance = await transactionService.getInitialBalance(customerId, startDate);
        finalBalance = await transactionService.getFinalBalance(customerId, endDate);
      } else {
        transactions = await transactionService.getTransactionsByCustomerId(customerId);
        finalBalance = await transactionService.getFinalBalance(customerId, new Date().toISOString().split('T')[0]);
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
  },
  getAnnualDataJSON: async (req, res, next) => {
    try {
      const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
      const annualData = await transactionService.getAnnualReport(year);
      return res.json({ success:true, report:annualData });
    } catch (err) {
      return next(err);
    }
  }
};

export default apiController;