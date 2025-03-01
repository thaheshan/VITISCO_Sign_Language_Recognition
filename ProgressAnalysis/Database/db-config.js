require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,       
  user: process.env.DB_USER,
  password: "ZAMS25sdgp#",
  database: "vitisco",
  port: process.env.DB_PORT || 3306
});


db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to AWS MySQL database!');
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
