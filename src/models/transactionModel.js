import pool from '../config/db.js';

const transactionModel = {
  createTransactionTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT,
        type VARCHAR(50) NOT NULL,
        method VARCHAR(50) DEFAULT NULL,
        description VARCHAR(50) DEFAULT NULL,
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
  getCustomerBalance: async (customer_id) => {
    const [rows] = await pool.query(
      `SELECT 
        SUM(CASE WHEN type = 'Egreso' THEN amount ELSE 0 END) AS total_egreso,
        SUM(CASE WHEN type = 'Ingreso' THEN amount ELSE 0 END) AS total_ingreso
      FROM transactions
      WHERE customer_id = ? AND is_deleted = FALSE`,
      [customer_id]
    );
    const total_egreso = rows[0].total_egreso || 0;
    const total_ingreso = rows[0].total_ingreso || 0;
    return total_ingreso - total_egreso;
  },
  createTransaction: async (transaction) => {
  // normalizar
  console.log('Received transaction data:', transaction);
  const customer_id = parseInt(transaction.customer_id);
  const amount = transaction.amount;
  const type = transaction.type;
  const method = transaction.method || null; // o null si no se proporciona
  const description = transaction.description || null;
  const transaction_date = transaction.date || null; // o null para usar DEFAULT
    console.log('Creating transaction with data:', { customer_id, amount, type, method, description, transaction_date });
    const [result] = await pool.query(
      'INSERT INTO transactions (customer_id, type, method, description, amount, transaction_date) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_id, type, method, description, amount, transaction_date]
    );
    return { id: result.insertId, ...transaction };
  },
  getTransactionsByCustomerId: async (customer_id) => {
    const [rows] = await pool.query(`SELECT
    id,
    transaction_date,
    type,
    method,
    amount,
    -- Calcula el saldo acumulado ajustando el signo según el 'type'
    SUM(
        CASE
            -- Si es 'Ingreso', suma el monto (asume amount es positivo)
            WHEN type = 'Ingreso' THEN amount
            -- Si es 'Egreso', resta el monto (asume amount es positivo)
            WHEN type = 'Egreso' THEN -amount
            WHEN type = 'Ajuste' THEN amount
            -- Si es cualquier otro tipo, maneja el monto como positivo por defecto
            ELSE amount
        END
    ) OVER (ORDER BY transaction_date ASC, id ASC) AS Saldo_Acumulado 
FROM 
    transactions 
WHERE 
    customer_id = ?
ORDER BY 
    transaction_date DESC, id DESC`, [customer_id]);
    return rows;
  },
  getAnnualReport: async (year) => {
    const [rows] = await pool.query(
      `SELECT
        MONTH(transaction_date) AS month,
        SUM(CASE WHEN type = 'Ingreso' THEN amount ELSE 0 END) AS total_ingreso,
        SUM(CASE WHEN type = 'Egreso' THEN amount ELSE 0 END) AS total_egreso
      FROM transactions
      WHERE YEAR(transaction_date) = ? AND is_deleted = FALSE
      GROUP BY MONTH(transaction_date)
      ORDER BY MONTH(transaction_date)`,
      [year]
    );
    // Asegurar que todos los meses estén representados en el informe
    const report = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = rows.find(r => r.month === month);
      report.push({
        month,
        total_ingreso: monthData ? parseFloat(monthData.total_ingreso) : 0,
        total_egreso: monthData ? parseFloat(monthData.total_egreso) : 0
      });
    }
    return report;
  }
}

export default transactionModel;