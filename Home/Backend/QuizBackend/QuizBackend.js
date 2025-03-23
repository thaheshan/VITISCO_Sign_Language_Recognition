require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
 

  host: process.env.DB_HOST,       
  user: process.env.DB_USER,       
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME   
  
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});




app.get("/quiz", (req, res) => {
  const { languageId, categoryId, userId } = req.query; // Get parameters from request query

  if (!languageId || !categoryId || !userId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const sql = `
    SELECT 
      q.quizId, 
      q.question, 
      q.questionText, 
      q.optionA, 
      q.optionB, 
      q.optionC, 
      q.optionD
    FROM Quiz q
    JOIN QuizSession qs ON q.quizId = qs.quizId
    WHERE qs.quizSessionId = (
        SELECT lcq.quizSessionId 
        FROM LanguageCategoryQuiz lcq
        LEFT JOIN UserQuizSession uqs 
          ON lcq.quizSessionId = uqs.quizSessionId 
          AND uqs.userId = ?
        WHERE lcq.languageId = ? 
          AND lcq.categoryId = ?
          AND (uqs.quizSessionId IS NULL) 
        LIMIT 1
    );
  `;

  db.query(sql, [userId, languageId, categoryId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});