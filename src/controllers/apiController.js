import pool from "../config/db.js";
import transactionController from "./transactionController.js";

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
  }
};

export default apiController;