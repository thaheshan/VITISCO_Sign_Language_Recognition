const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3306;
app.use(cors());
app.use(express.json());

// Database connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change as per your MySQL setup
  password: '', // Change as per your MySQL setup
  database: 'vitisco' // Database name
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Database connection failed: ', err);
  } else {
    console.log('Connected to database');
  }
});

// API endpoint to fetch all quiz questions
app.get('/api/questions', (req, res) => {
  const language = req.query.language; // Optional language filter
  
  let query = 'SELECT * FROM questions';
  let params = [];
  
  if (language) {
    query += ' WHERE language = ?';
    params.push(language);
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// API endpoint to fetch questions by language
app.get('/api/questions/:language', (req, res) => {
  const language = req.params.language;
  
  db.query('SELECT * FROM questions WHERE language = ?', [language], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: `No questions found for ${language} language` });
    }
    res.json(results);
  });
});

// API endpoint to fetch a specific question by ID
app.get('/api/question/:id', (req, res) => {
  const questionId = req.params.id;
  
  db.query('SELECT * FROM questions WHERE id = ?', [questionId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(results[0]);
  });
});

// API endpoint to check the answer dynamically
app.post('/api/check-answer', (req, res) => {
  const { question_id, answer_index } = req.body;

  db.query('SELECT correct_answer_index FROM questions WHERE id = ?', [question_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const correctIndex = results[0].correct_answer_index;
    
    if (answer_index === correctIndex) {
      res.json({ correct: true, message: 'Correct answer!' });
    } else {
      res.json({ correct: false, message: 'Incorrect answer, try again!' });
    }
  });
});

// API endpoint to save quiz results
app.post('/api/results', (req, res) => {
  const { language, answers, timestamp } = req.body;
  
  // Assuming you have a 'quiz_results' table
  // This is a simple implementation - you might want to store more detailed results
  const query = 'INSERT INTO quiz_results (language, answers, timestamp) VALUES (?, ?, ?)';
  
  db.query(query, [language, JSON.stringify(answers), timestamp], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      id: result.insertId,
      message: 'Quiz results saved successfully' 
    });
  });
});

// API endpoint to add a new question
app.post('/api/questions', (req, res) => {
  const { question_text, options, correct_answer_index, language, image_url } = req.body;
  
  // Validate input
  if (!question_text || !options || correct_answer_index === undefined || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Convert options array to JSON string if it's an array
  const optionsData = typeof options === 'string' ? options : JSON.stringify(options);
  
  const query = 'INSERT INTO questions (question_text, options, correct_answer_index, language, image_url) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [question_text, optionsData, correct_answer_index, language, image_url || null], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      id: result.insertId,
      message: 'Question added successfully' 
    });
  });
});

// API endpoint to update a question
app.put('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const { question_text, options, correct_answer_index, language, image_url } = req.body;
  
  // Build the query dynamically based on what fields are provided
  let query = 'UPDATE questions SET ';
  const values = [];
  const updateFields = [];
  
  if (question_text) {
    updateFields.push('question_text = ?');
    values.push(question_text);
  }
  
  if (options) {
    updateFields.push('options = ?');
    // Convert options array to JSON string if it's an array
    const optionsData = typeof options === 'string' ? options : JSON.stringify(options);
    values.push(optionsData);
  }
  
  if (correct_answer_index !== undefined) {
    updateFields.push('correct_answer_index = ?');
    values.push(correct_answer_index);
  }
  
  if (language) {
    updateFields.push('language = ?');
    values.push(language);
  }
  
  if (image_url !== undefined) {
    updateFields.push('image_url = ?');
    values.push(image_url);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  query += updateFields.join(', ') + ' WHERE id = ?';
  values.push(questionId);
  
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question updated successfully' });
  });
});

// API endpoint to delete a question
app.delete('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  
  db.query('DELETE FROM questions WHERE id = ?', [questionId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});