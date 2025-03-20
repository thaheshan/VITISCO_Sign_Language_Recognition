const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

// Database connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change as per your MySQL setup
  password: '', // Change as per your MySQL setup
  database: 'quiz_db' // Database name
});

// Connect to the database
// Logs an error if the connection fails
// Logs success if the connection is established

  db.connect(err => {
  if (err) {
    console.error('Database connection failed: ', err);
  } else {
    console.log('Connected to database');
  }
});

// API endpoint to fetch all quiz questions
app.get('/questions', (req, res) => {
  db.query('SELECT * FROM questions', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// API endpoint to check the answer dynamically
// Each question has its own predefined correct answer index
app.post('/check-answer', (req, res) => {
  const { question_id, answer_index } = req.body; // Get question ID and selected answer index from request

  // Query database to get the correct answer index for the given question
  db.query('SELECT correct_answer_index FROM questions WHERE id = ?', [question_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const correctIndex = results[0].correct_answer_index; // Retrieve correct answer index from database
    
    if (answer_index === correctIndex) {
      res.json({ correct: true, message: 'Correct answer!' });
    } else {
      res.json({ correct: false, message: 'Incorrect answer, try again!' });
    }
  });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});