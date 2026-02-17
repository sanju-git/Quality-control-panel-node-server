const sql = require("mssql");
require("dotenv").config();

const config = {
  server: process.env.DB_HOST,
  authentication: {
    type: "default",
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  options: {
    database: process.env.DB_NAME,
    encrypt: true,
    trustServerCertificate: true,
    connectionTimeout: 15000,
    requestTimeout: 30000,
  },
};

const pool = new sql.ConnectionPool(config);

// Test connection
pool.connect().then((pool) => {
  console.log("Database connected successfully");
  return pool;
}).catch((err) => {
  console.error("Error connecting to database", err);
});

module.exports = pool;
