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
  host: "localhost",
  user: "root",
  password: "",
  database: "vitisco",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});

// // Sample route
// app.get("/", (req, res) => {
//   res.send("Backend is running!");
// });

// Fetch data from database
// app.get("/data", (req, res) => {
//   db.query("SELECT * FROM user", (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });
//Fetch lesson completion status (Pass languageName and userId as parameters)
app.get("/user-progress", (req, res) => {
  const { languageName, userId } = req.query; // Expecting query params

  const query = `
    SELECT 
      c.categoryName,
      COALESCE(COUNT(DISTINCT CASE 
          WHEN l.languageId = (SELECT languageId FROM Language WHERE languageName = ?) 
          AND ul.completionStatus = true THEN l.lessonId 
      END), 0) AS progress,
      COALESCE(COUNT(DISTINCT CASE 
          WHEN l.languageId = (SELECT languageId FROM Language WHERE languageName = ?) 
          THEN l.lessonId 
      END), 0) AS total
    FROM 
      Category c
      LEFT JOIN Lesson l ON c.categoryId = l.categoryId
      LEFT JOIN UserLesson ul ON l.lessonId = ul.lessonId AND ul.userId = ?
    GROUP BY 
      c.categoryName
    ORDER BY 
      CASE 
        WHEN c.categoryName = 'Basic' THEN 1
        WHEN c.categoryName = 'Intermediate' THEN 2
        WHEN c.categoryName = 'Advanced' THEN 3
      END;
  `;

  db.query(query, [languageName, languageName, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

//Fetch total XP points (Pass userId as a parameter)
app.get("/user-xp/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      COALESCE(SUM(l.XPPoints), 0) + 
      COALESCE(SUM(c.XPPoints), 0) + 
      COALESCE(SUM(q.XPPoints), 0) + 
      COALESCE(SUM(vc.XPPoints), 0) + 
      COALESCE(SUM(uq.marksXPPoints), 0) + 
      COALESCE(SUM(vr.winnerXPPoints), 0) AS totalXP
    FROM 
      User u
    LEFT JOIN 
      UserLesson ul ON u.userId = ul.userId
    LEFT JOIN 
      Lesson l ON ul.lessonId = l.lessonId
    LEFT JOIN 
      UserChallenge uc ON u.userId = uc.userId
    LEFT JOIN 
      Challenge c ON uc.challengeId = c.challengeId
    LEFT JOIN 
      UserQuiz uq ON u.userId = uq.userId
    LEFT JOIN 
      Quiz q ON uq.quizId = q.quizId
    LEFT JOIN 
      VirtualRoom vr ON u.userId = vr.hostId
    LEFT JOIN 
      VirtualRoomQuiz vrq ON vr.roomCode = vrq.roomCode
    LEFT JOIN 
      Quiz vc ON vrq.quizId = vc.quizId
    WHERE 
      u.userId = ?;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]); // Return the first result object (total XP)
  });
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
