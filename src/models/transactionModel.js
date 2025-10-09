import pool from '../config/db.js';

const transactionModel = {
  createTransactionTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT,
        type VARCHAR(50) NOT NULL,
        method VARCHAR(50) DEFAULT NULL,
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
  createTransaction: async (transaction) => {
  // normalizar
  console.log('Received transaction data:', transaction);
  const customer_id = parseInt(transaction.customer_id);
  const amount = transaction.amount;
  const type = transaction.type;
  const method = transaction.method || ''; // o null si no se proporciona
  const transaction_date = transaction.date || NULL; // o null para usar DEFAULT
    console.log('Creating transaction with data:', { customer_id, amount, type, method, transaction_date });
    const [result] = await pool.query(
      'INSERT INTO transactions (customer_id, type, method, amount, transaction_date) VALUES (?, ?, ?, ?, ?)',
      [customer_id, type, method, amount, transaction_date]
    );
    return { id: result.insertId, ...transaction };
  },
  getTransactionsByCustomerId: async (customer_id) => {
    const [rows] = await pool.query('SELECT * FROM transactions WHERE customer_id = ?', [customer_id]);
    return rows;
  }
}

export default transactionModel;