import pool from '../config/db.js';

const customerModel = {
  createCustomerTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS customer (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(15),
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        zone_id INT,
        FOREIGN KEY (zone_id) REFERENCES zone(id)
        );`
        // Agrega otros campos según sea necesario
        try {
    await pool.query(query);
    console.log('Tabla "customer" verificada/creada');
  } catch (err) {
    console.error('Error creando la tabla "customer":', err);
    throw err;
  }
},
  getAllCustomers: async () => {
  const [rows] = await pool.query('SELECT * FROM customer');
  return rows;
},


  getCustomerById: async (id) => {
  const [rows] = await pool.query('SELECT * FROM customer WHERE id = ?', [id]);
  return rows[0];
},

  getCustomerByName: async (name) => {
  const [rows] = await pool.query('SELECT * FROM customer WHERE name LIKE ?', [`%${name}%`]);
  console.log("Query result:", rows);
  console.log([`%${name}$`])
  return rows;
},
  addCustomer: async (customer) => {
  const {name, phone_number, address, city, state } = customer;
  const [result] = await pool.query(
    'INSERT INTO customer (name, phone_number, address, city, state) VALUES (?, ?, ?, ?, ?)',
    [name, phone_number, address, city, state]
  );
  return { id: result.insertId, ...customer };
},
  updateCustomer: async (id, customer) => {
    const { name, phone_number, address, city, state, zone_id } = customer;
    const [result] = await pool.query(
      'UPDATE customer SET name = ?, phone_number = ?, address = ?, city = ?, state = ?, zone_id = ? WHERE id = ?',
      [name, phone_number, address, city, state, zone_id, id]
    );
    return result.affectedRows > 0;
}
}

export default customerModel;
