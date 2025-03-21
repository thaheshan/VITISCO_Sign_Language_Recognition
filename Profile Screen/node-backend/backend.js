const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files (profile pictures)

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "vitisco123", // Replace with your MySQL password
  database: "vitisco", // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// Multer configuration for file uploads (profile pictures)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes

// Get User Profile
app.get("/api/profile/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = "SELECT * FROM users WHERE userId = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(results[0]);
  });
});

// Update User Profile
app.put("/api/profile/:userId", (req, res) => {
  const userId = req.params.userId;
  const { name, location, phone, email, gender, nativeLanguage } = req.body;
  const query = `
    UPDATE users 
    SET name = ?, location = ?, phone = ?, email = ?, gender = ?, nativeLanguage = ?
    WHERE userId = ?
  `;

  db.query(
    query,
    [name, location, phone, email, gender, nativeLanguage, userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "Profile updated successfully" });
    }
  );
});

// Upload Profile Picture
app.post(
  "/api/profile/:userId/upload",
  upload.single("profilePic"),
  (req, res) => {
    const userId = req.params.userId;
    const profilePicUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    const query = "UPDATE users SET profilePic = ? WHERE userId = ?";

    db.query(query, [profilePicUrl, userId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        message: "Profile picture updated successfully",
        profilePicUrl,
      });
    });
  }
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
