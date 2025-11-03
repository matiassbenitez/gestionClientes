//import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config();

// const pool = mysql.createPool(process.env.DB_URI);

// export default pool;

import sequelize from '../config/sequelize.js';
import User from '../models/userModel.js';

const db = sequelize;
db.User = User
export default db;