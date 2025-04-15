// server.js - Backend for NotificationScreen React Native application

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "34.67.39.101",
  user: process.env.DB_USER || "admin123",
  password: process.env.DB_PASSWORD || "vitisco123",
  database: process.env.DB_NAME || "vitisco",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Get promise-based version of the pool for async/await usage
const promisePool = pool.promise();

// Initialize database tables
async function initializeDatabase() {
  try {
    // Notifications table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completion INT DEFAULT 0,
        date DATE,
        next_date VARCHAR(255),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Feedbacks table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completion INT DEFAULT 0,
        date DATE,
        next_date VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Suggestions table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data if tables are empty
    await insertSampleData();

    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

// Insert sample data
async function insertSampleData() {
  try {
    // Check if we have notifications data
    const [notificationRows] = await promisePool.query(
      "SELECT COUNT(*) as count FROM notifications"
    );

    if (notificationRows[0].count === 0) {
      // Insert sample notifications
      const sampleNotifications = [
        {
          title: "Lessons",
          description:
            "You completed 75% from the expected lesson on this day and your learning progress was so good.",
          completion: 75,
          date: "2025-03-21",
          next_date: "Next week",
          category: "today",
        },
        {
          title: "Lessons",
          description:
            "You completed 75% from the expected lesson on this day and your learning progress was so good.",
          completion: 75,
          date: "2025-03-21",
          next_date: "Next week",
          category: "today",
        },
        {
          title: "Lessons",
          description:
            "You completed 75% from the expected lesson on this day and your learning progress was so good.",
          completion: 75,
          date: "2025-03-21",
          next_date: "Next week",
          category: "yesterday",
        },
        {
          title: "Lessons",
          description:
            "You completed 75% from the expected lesson on this day and your learning progress was so good.",
          completion: 75,
          date: "2025-03-21",
          next_date: "Next week",
          category: "yesterday",
        },
      ];

      for (const notification of sampleNotifications) {
        await promisePool.query(
          "INSERT INTO notifications SET ?",
          notification
        );
      }

      console.log("Sample notifications inserted");
    }

    // Check if we have feedbacks data
    const [feedbackRows] = await promisePool.query(
      "SELECT COUNT(*) as count FROM feedbacks"
    );

    if (feedbackRows[0].count === 0) {
      // Insert sample feedbacks
      const sampleFeedbacks = [
        {
          title: "Lessons",
          description:
            "You completed 75% from the expected lesson on this day and your learning progress was so good.",
          completion: 75,
          date: "2025-03-21",
          next_date: "Next week",
        },
        {
          title: "Lessons",
          description:
            "You completed 75% from the expected lesson on this day and your learning progress was so good.",
          completion: 75,
          date: "2025-03-21",
          next_date: "Next week",
        },
      ];

      for (const feedback of sampleFeedbacks) {
        await promisePool.query("INSERT INTO feedbacks SET ?", feedback);
      }

      console.log("Sample feedbacks inserted");
    }
  } catch (err) {
    console.error("Error inserting sample data:", err);
  }
}

// Root route for basic API information
app.get("/", (req, res) => {
  res.send(`
    <h1>NotificationScreen API</h1>
    <p>Available endpoints:</p>
    <ul>
      <li>GET /api/notifications - Get all notifications</li>
      <li>GET /api/feedbacks - Get all feedbacks</li>
      <li>GET /api/suggestions - Get all suggestions</li>
      <li>GET /api/notifications/:id - Get notification by ID</li>
      <li>POST /api/notifications - Create new notification</li>
      <li>POST /api/feedbacks - Create new feedback</li>
      <li>POST /api/suggestions - Create new suggestion</li>
    </ul>
  `);
});

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
// GET all notifications with optional time filter
app.get("/api/notifications", async (req, res) => {
  try {
    const { timeFilter } = req.query;
    let query = "SELECT * FROM notifications";

    if (timeFilter && timeFilter !== "all") {
      query += ` WHERE category = ?`;
      var [rows] = await promisePool.query(query, [timeFilter]);
    } else {
      var [rows] = await promisePool.query(query);
    }

    // Format the date to match frontend expectations
    const formattedResults = rows.map((item) => {
      const dateObj = new Date(item.date);
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        completion: item.completion,
        date: `${dateObj.getDate()} ${dateObj.toLocaleString("default", {
          month: "long",
        })}`,
        nextDate: item.next_date,
        category: item.category,
      };
    });

    res.json(formattedResults);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// GET all feedbacks
app.get("/api/feedbacks", async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM feedbacks ORDER BY created_at DESC"
    );

    // Format the date to match frontend expectations
    const formattedResults = rows.map((item) => {
      const dateObj = new Date(item.date);
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        completion: item.completion,
        date: `${dateObj.getDate()} ${dateObj.toLocaleString("default", {
          month: "long",
        })}`,
        nextDate: item.next_date,
      };
    });

    res.json(formattedResults);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
});

// GET all suggestions
app.get("/api/suggestions", async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM suggestions ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// GET notification by ID
app.get("/api/notifications/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await promisePool.query(
      "SELECT * FROM notifications WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Format the date
    const item = rows[0];
    const dateObj = new Date(item.date);
    const formattedResult = {
      id: item.id,
      title: item.title,
      description: item.description,
      completion: item.completion,
      date: `${dateObj.getDate()} ${dateObj.toLocaleString("default", {
        month: "long",
      })}`,
      nextDate: item.next_date,
      category: item.category,
      // Add additional data that might be useful for the modal
      timeSpent: "45 minutes",
      completedTasks: "8/10",
    };

    res.json(formattedResult);
  } catch (err) {
    console.error("Error fetching notification:", err);
    res.status(500).json({ error: "Failed to fetch notification" });
  }
});

// POST new notification
app.post("/api/notifications", async (req, res) => {
  try {
    const { title, description, completion, date, nextDate, category } =
      req.body;

    const notification = {
      title,
      description,
      completion,
      date: new Date(date),
      next_date: nextDate,
      category,
    };

    const [result] = await promisePool.query(
      "INSERT INTO notifications SET ?",
      notification
    );

    res.status(201).json({
      id: result.insertId,
      ...notification,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Similar POST routes for feedbacks and suggestions
app.post("/api/feedbacks", async (req, res) => {
  try {
    const { title, description, completion, date, nextDate } = req.body;

    const feedback = {
      title,
      description,
      completion,
      date: new Date(date),
      next_date: nextDate,
    };

    const [result] = await promisePool.query(
      "INSERT INTO feedbacks SET ?",
      feedback
    );

    res.status(201).json({
      id: result.insertId,
      ...feedback,
    });
  } catch (err) {
    console.error("Error creating feedback:", err);
    res.status(500).json({ error: "Failed to create feedback" });
  }
});

app.post("/api/suggestions", async (req, res) => {
  try {
    const { title, description } = req.body;

    const suggestion = {
      title,
      description,
    };

    const [result] = await promisePool.query(
      "INSERT INTO suggestions SET ?",
      suggestion
    );

    res.status(201).json({
      id: result.insertId,
      ...suggestion,
    });
  } catch (err) {
    console.error("Error creating suggestion:", err);
    res.status(500).json({ error: "Failed to create suggestion" });
  }
});

// Initialize database on startup
initializeDatabase();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling for unexpected errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

