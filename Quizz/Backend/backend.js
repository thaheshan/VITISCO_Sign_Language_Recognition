const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change as per your MySQL setup
  password: '', // Change as per your MySQL setup
  database: 'quiz_db'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed: ', err);
  } else {
    console.log('Connected to database');
  }
});

// Fetch all questions
app.get('/questions', (req, res) => {
  db.query('SELECT * FROM questions', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Check answer (ensuring the 2nd answer is correct)
app.post('/check-answer', (req, res) => {
  const { question_id, answer_index } = req.body;
  if (answer_index === 1) { // Since index starts from 0, 2nd answer is at index 1
    res.json({ correct: true, message: 'Correct answer!' });
  } else {
    res.json({ correct: false, message: 'Incorrect answer, try again!' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
