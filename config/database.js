const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || 1433),
  options: {
    encrypt: true, // Use encryption for Azure
    trustServerCertificate: true // Change to false for production with proper SSL
  },
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || 30000),
  requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || 30000),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Connection pool
let poolPromise = null;

const getConnection = async () => {
  try {
    if (!poolPromise) {
      poolPromise = sql.connect(config);
      console.log('✅ MS SQL Database connection pool created');
    }
    return await poolPromise;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    poolPromise = null;
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (poolPromise) {
      await (await poolPromise).close();
      poolPromise = null;
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  sql,
  getConnection,
  closeConnection
};

