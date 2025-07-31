const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection details:', {
      host: connection.config.host,
      database: connection.config.database
    });
    connection.release();
  } catch (error) {
    console.error('Detailed Database Connection Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
};

// Call the test connection function
testConnection();

module.exports = { pool };
