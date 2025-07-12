const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "QC_DB",
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: false, // <- this fixes the issue
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
