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


//Fetch lesson completion status (Pass languageName and userId as parameters)
app.get("/user-progress", (req, res) => {
  const { languageName, userId } = req.query; // Expecting query params

  const query = `
    SELECT 
      c.categoryName,
      COALESCE(COUNT(DISTINCT CASE 
          WHEN l.languageId = (SELECT languageId FROM language WHERE languageName = ?) 
          AND ul.completionStatus = true THEN l.lessonId 
      END), 0) AS progress,
      COALESCE(COUNT(DISTINCT CASE 
          WHEN l.languageId = (SELECT languageId FROM language WHERE languageName = ?) 
          THEN l.lessonId 
      END), 0) AS total
    FROM 
      Category c
      LEFT JOIN lesson l ON c.categoryId = l.categoryId
      LEFT JOIN userlesson ul ON l.lessonId = ul.lessonId AND ul.userId = ?
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
      user u
    LEFT JOIN 
      userlesson ul ON u.userId = ul.userId
    LEFT JOIN 
      lesson l ON ul.lessonId = l.lessonId
    LEFT JOIN 
      userchallenge uc ON u.userId = uc.userId
    LEFT JOIN 
      challenge c ON uc.challengeId = c.challengeId
    LEFT JOIN 
      userquiz uq ON u.userId = uq.userId
    LEFT JOIN 
      quiz q ON uq.quizId = q.quizId
    LEFT JOIN 
      virtualroom vr ON u.userId = vr.hostId
    LEFT JOIN 
      virtualroomquiz vrq ON vr.roomCode = vrq.roomCode
    LEFT JOIN 
      quiz vc ON vrq.quizId = vc.quizId
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

// Fetch average quiz marks and time taken (Pass userId and languageName as parameters)
app.get("/user-average", (req, res) => {
  const { userId, languageName } = req.query;

  const query = `
    SELECT 
      AVG(uq.marksPercentage) AS averageMarks,
      AVG(uq.minutes * 60 + uq.seconds) / 60 AS averageTimeMinutes
    FROM userquiz uq
    INNER JOIN quiz q ON uq.quizId = q.quizId
    INNER JOIN language l ON q.languageId = l.languageId
    WHERE uq.userId = ? 
    AND l.languageName = ?;
  `;

  db.query(query, [userId, languageName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    console.log("SQL Results:", results);

    // Handle cases where no quiz records exist for the user in the given language
    const averageMarks = results[0].averageMarks !== null ? results[0].averageMarks : 0;
    const averageTimeMinutes = results[0].averageTimeMinutes !== null ? results[0].averageTimeMinutes : 0;

    res.json({
      userId,
      languageName,
      averageMarks,
      averageTimeMinutes
    });
  });
});

// Fetch weekly XP chart data (Pass userId as a parameter)
app.get('/userXPchart/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
      SELECT day_name, totalXP FROM (
         
          SELECT DATE_FORMAT(date, '%a') AS day_name, xpPoints AS totalXP
          FROM userxp
          WHERE userId = ? 

          UNION ALL

     
          SELECT DAYNAME(CURDATE()) AS day_name, 
              COALESCE(SUM(l.XPPoints), 0) + 
              COALESCE(SUM(c.XPPoints), 0) + 
              COALESCE(SUM(q.XPPoints), 0) + 
              COALESCE(SUM(vc.XPPoints), 0) + 
              COALESCE(SUM(uq.marksXPPoints), 0) + 
              COALESCE(SUM(vr.winnerXPPoints), 0) AS totalXP
          FROM user u
          LEFT JOIN userlesson ul ON u.userId = ul.userId
          LEFT JOIN lesson l ON ul.lessonId = l.lessonId
          LEFT JOIN userchallenge uc ON u.userId = uc.userId
          LEFT JOIN challenge c ON uc.challengeId = c.challengeId
          LEFT JOIN userquiz uq ON u.userId = uq.userId
          LEFT JOIN quiz q ON uq.quizId = q.quizId
          LEFT JOIN virtualroom vr ON u.userId = vr.hostId
          LEFT JOIN virtualroomquiz vrq ON vr.roomCode = vrq.roomCode
          LEFT JOIN quiz vc ON vrq.quizId = vc.quizId
          WHERE u.userId = ?
      ) AS combinedXP
  `;

  db.query(query, [userId, userId], (err, results) => {
      if (err) {
          console.error("Error fetching XP data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }

      // Extract labels and data for chart
      const labels = results.map(row => row.day_name); 
      const data = results.map(row => row.totalXP);

      // Respond with the formatted data for the front-end chart
      res.json({ labels, datasets: [{ data }] });
  });
});






// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
