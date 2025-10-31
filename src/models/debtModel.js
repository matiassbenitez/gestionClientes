import pool from "../config/db.js";

const debtModel = {
  createDebtTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS debts ( 
        id INT PRIMARY KEY AUTO_INCREMENT,
        debt_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        amount DECIMAL(10, 2) NOT NULL
      );`
      try {
      await pool.query(query);
      console.log('Tabla "debts" verificada/creada');
    } catch (err) {
      console.error('Error creando la tabla "debts":', err);
      throw err;
    }
  },
  getAllDebts: async () => {
    const [rows] = await pool.query('SELECT * FROM debts ORDER BY debt_date DESC');
    return rows;
  },
  getDebtById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM debts WHERE id = ?', [id]);
    return rows[0];
  },
  createDebt: async (debt) => {
    const { amount, debt_date } = debt;
    const [result] = await pool.query(
      'INSERT INTO debts (amount, debt_date) VALUES (?, ?)',
      [amount, debt_date]
    );
    return { id: result.insertId, ...debt };
  },
  updateDebt: async (id, debt) => {
    const { amount, debt_date } = debt;
    const [result] = await pool.query(
      'UPDATE debts SET amount = ?, debt_date = ? WHERE id = ?',
      [amount, debt_date, id]
    );
    return result.affectedRows > 0;
  },
};

export default debtModel;