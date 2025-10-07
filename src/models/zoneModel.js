import pool from "../config/db.js";

const zoneModel = {
  createZoneTable: async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS zone (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL
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
} 
}

export default zoneModel;