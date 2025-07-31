const db = require('./db'); // Ensure correct path

async function testConnection() {
  try {
    const [result] = await db.pool.query('SELECT 1 + 1 AS test'); // Use `pool.query`
    console.log('Database connection successful:', result);
  } catch (error) {
    console.error(' Database connection failed:', error);
  }
}

testConnection();
