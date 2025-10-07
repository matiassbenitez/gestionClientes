import { parse } from 'dotenv'
import pool from '../config/db.js'

const userModel = {
  createUserTable: async () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    try {
      await pool.query(sql)
      console.log('User table created or already exists.')
    } catch (error) {
      console.error('Error creating user table:', error)
    }
},
  createUser: async (username, password) => {
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)'
    try {
      const res = await pool.query(sql, [username, password])
      return { id: res.insertId, username }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },
  countUsers: async () => {
    const sql = 'SELECT COUNT(*) AS userCount FROM users'
    try {
      const [rows] = await pool.query(sql)
      return parseInt(rows[0].userCount, 10)
    } catch (error) {
      console.error('Error counting users:', error)
      throw new Error('Error counting users')
    }
  },
  findUserByUsername: async (username) => {
    const sql = 'SELECT * FROM users WHERE username = ?'
    try {
      const [rows] = await pool.query(sql, [username])
      return rows[0]
    } catch (error) {
      console.error('Error finding user by username:', error)
      throw error
    }
  }
}

export default userModel