const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  uri: process.env.MYSQL_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = db;