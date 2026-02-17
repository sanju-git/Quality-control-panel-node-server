const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: false,
});


// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error acquiring client", err.stack);
  } else {
    console.log("Database connected successfully");
    release();
  }
});

module.exports = pool;
