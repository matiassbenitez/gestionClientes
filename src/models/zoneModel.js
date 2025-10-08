import pool from "../config/db.js";

const zoneModel = {
  createZoneTable: async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS zone (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      is_deleted BOOLEAN DEFAULT FALSE
    );`
    try {
    await pool.query(sql);
    console.log('Zone table created or already exists.');
  } catch (err) {
    console.error('Error creating zone table:', err);
  }
  // Aquí puedes agregar más métodos relacionados con la zona si es necesario
},
  createZone: async (name) => {
    const sql = 'INSERT INTO zone (name) VALUES (?)';
    try {
      const [result] = await pool.query(sql, [name]);
      return { id: result.insertId, name };
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  },
  getZoneById: async (id) => {
    const sql = 'SELECT * FROM zone WHERE id = ? AND is_deleted = FALSE';
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
  },
  getAllZones: async () => {
    const [rows] = await pool.query('SELECT * FROM zone WHERE is_deleted = FALSE');
    return rows;
  },
  updateZone: async (id, name) => {
    const sql = 'UPDATE zone SET name = ? WHERE id = ?';
    const [result] = await pool.query(sql, [name, id]);
    return result.affectedRows > 0;
},
}

export default zoneModel;