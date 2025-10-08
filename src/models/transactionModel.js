import pool from '../config/db.js';

const transactionModel = {
  createTransactionTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customer(id)
      );`
      try {
      await pool.query(query);
      console.log('Tabla "transactions" verificada/creada');
    } catch (err) {
      console.error('Error creando la tabla "transactions":', err);
      throw err;
    }
  },
  getAllTransactions: async () => {
    const [rows] = await pool.query('SELECT * FROM transactions WHERE is_deleted = FALSE');
    return rows;
  },
  getTransactionById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ? AND is_deleted = FALSE', [id]);
    return rows[0];
  },
  addTransaction: async (transaction) => {
    const { customer_id, type, amount, transaction_date } = transaction;
    const [result] = await pool.query(
      'INSERT INTO transactions (customer_id, type, amount, transaction_date) VALUES (?, ?, ?, ?)',
      [customer_id, type, amount, transaction_date]
    );
    return { id: result.insertId, ...transaction };
  },
  getTransactionsByCutomerId: async (customer_id) => {
    const [rows] = await pool.query('SELECT * FROM transactions WHERE customer_id = ?', [customer_id]);
    return rows;
  }
}

export default transactionModel;