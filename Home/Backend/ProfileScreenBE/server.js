// server.js - Backend for ProfileScreen React Native application

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

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
    // Users table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        handle VARCHAR(50) NOT NULL,
        level INT DEFAULT 1,
        location VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255) NOT NULL,
        gender VARCHAR(20),
        nativeLanguage VARCHAR(50),
        following INT DEFAULT 0,
        followers INT DEFAULT 0,
        membershipType VARCHAR(50) DEFAULT 'Standard',
        points INT DEFAULT 0,
        notifications INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Badges table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(10) NOT NULL,
        badgeId INT NOT NULL,
        badgeName VARCHAR(100) NOT NULL,
        badgeImage VARCHAR(255) NOT NULL,
        dateEarned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(userId)
      )
    `);

    // Rewards table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(10) NOT NULL,
        rewardId INT NOT NULL,
        rewardName VARCHAR(100) NOT NULL,
        rewardImage VARCHAR(255) NOT NULL,
        dateEarned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(userId)
      )
    `);

    // Vouchers table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        discount INT NOT NULL,
        pointsCost INT NOT NULL,
        eligibility VARCHAR(50) DEFAULT 'all',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User vouchers (redeemed) table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS user_vouchers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(10) NOT NULL,
        voucherId INT NOT NULL,
        isRedeemed BOOLEAN DEFAULT FALSE,
        redeemedDate TIMESTAMP NULL,
        expiryDate TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(userId),
        FOREIGN KEY (voucherId) REFERENCES vouchers(id)
      )
    `);

    // XP Points History table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS xp_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(10) NOT NULL,
        points INT NOT NULL,
        reason VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(userId)
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
    // Check if we have users data
    const [userRows] = await promisePool.query(
      "SELECT COUNT(*) as count FROM users"
    );

    if (userRows[0].count === 0) {
      // Insert sample user
      const sampleUser = {
        userId: "VIT5643",
        name: "Zuhar Ahamed",
        handle: "@zheong123",
        level: 5,
        location: "Puttalam, Sri Lanka",
        phone: "+94 76 495 7194",
        email: "zuharahamed007@gmail.com",
        gender: "Male",
        nativeLanguage: "Tamil",
        following: 140,
        followers: 100,
        membershipType: "Gold",
        points: 1200,
        notifications: 21,
      };

      await promisePool.query("INSERT INTO users SET ?", sampleUser);
      console.log("Sample user inserted");

      // Insert sample badges
      const sampleBadges = [
        {
          userId: "VIT5643",
          badgeId: 1,
          badgeName: "Badge 1",
          badgeImage: "/assets/b1.png",
        },
        {
          userId: "VIT5643",
          badgeId: 2,
          badgeName: "Badge 2",
          badgeImage: "/assets/b2.png",
        },
        {
          userId: "VIT5643",
          badgeId: 3,
          badgeName: "Badge 3",
          badgeImage: "/assets/b3.png",
        },
        {
          userId: "VIT5643",
          badgeId: 4,
          badgeName: "Badge 4",
          badgeImage: "/assets/b4.png",
        },
      ];

      for (const badge of sampleBadges) {
        await promisePool.query("INSERT INTO badges SET ?", badge);
      }
      console.log("Sample badges inserted");

      // Insert sample rewards
      const sampleRewards = [
        {
          userId: "VIT5643",
          rewardId: 1,
          rewardName: "Reward 1",
          rewardImage: "/assets/r1.png",
        },
        {
          userId: "VIT5643",
          rewardId: 2,
          rewardName: "Reward 2",
          rewardImage: "/assets/r2.png",
        },
        {
          userId: "VIT5643",
          rewardId: 3,
          rewardName: "Reward 3",
          rewardImage: "/assets/r3.png",
        },
        {
          userId: "VIT5643",
          rewardId: 4,
          rewardName: "Reward 4",
          rewardImage: "/assets/r4.png",
        },
      ];

      for (const reward of sampleRewards) {
        await promisePool.query("INSERT INTO rewards SET ?", reward);
      }
      console.log("Sample rewards inserted");

      // Insert sample vouchers
      const sampleVouchers = [
        {
          title: "10% discount voucher",
          description: "For all members",
          discount: 10,
          pointsCost: 1000,
          eligibility: "all",
        },
        {
          title: "25% discount voucher",
          description: "For platinum members",
          discount: 25,
          pointsCost: 2500,
          eligibility: "platinum",
        },
      ];

      for (const voucher of sampleVouchers) {
        await promisePool.query("INSERT INTO vouchers SET ?", voucher);
      }
      console.log("Sample vouchers inserted");

      // Insert sample XP
      const sampleXP = {
        userId: "VIT5643",
        points: 2500,
        reason: "Initial XP",
      };

      await promisePool.query("INSERT INTO xp_history SET ?", sampleXP);
      console.log("Sample XP history inserted");
    }
  } catch (err) {
    console.error("Error inserting sample data:", err);
  }
}

// Routes
// GET user profile
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await promisePool.query(
      "SELECT * FROM users WHERE userId = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Format the response
    const user = rows[0];
    const userData = {
      userId: user.userId,
      name: user.name,
      handle: user.handle,
      level: user.level,
      location: user.location,
      phone: user.phone,
      email: user.email,
      gender: user.gender,
      nativeLanguage: user.nativeLanguage,
      following: user.following,
      followers: user.followers,
      membershipType: user.membershipType,
      points: user.points,
      notifications: user.notifications,
    };

    res.json(userData);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// GET user badges
app.get("/api/profile/:userId/badges", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await promisePool.query(
      "SELECT * FROM badges WHERE userId = ?",
      [userId]
    );

    const badges = rows.map((badge) => ({
      id: badge.badgeId,
      name: badge.badgeName,
      source: badge.badgeImage,
      dateEarned: badge.dateEarned,
    }));

    res.json(badges);
  } catch (err) {
    console.error("Error fetching user badges:", err);
    res.status(500).json({ error: "Failed to fetch user badges" });
  }
});

// GET user rewards
app.get("/api/profile/:userId/rewards", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await promisePool.query(
      "SELECT * FROM rewards WHERE userId = ?",
      [userId]
    );

    const rewards = rows.map((reward) => ({
      id: reward.rewardId,
      name: reward.rewardName,
      source: reward.rewardImage,
      dateEarned: reward.dateEarned,
    }));

    res.json(rewards);
  } catch (err) {
    console.error("Error fetching user rewards:", err);
    res.status(500).json({ error: "Failed to fetch user rewards" });
  }
});

// GET available vouchers
app.get("/api/vouchers", async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM vouchers ORDER BY pointsCost ASC"
    );

    const vouchers = rows.map((voucher) => ({
      id: voucher.id,
      title: voucher.title,
      description: voucher.description,
      discount: voucher.discount,
      pointsCost: voucher.pointsCost,
      eligibility: voucher.eligibility,
    }));

    res.json(vouchers);
  } catch (err) {
    console.error("Error fetching vouchers:", err);
    res.status(500).json({ error: "Failed to fetch vouchers" });
  }
});

// POST redeem a voucher
app.post("/api/profile/:userId/redeem-voucher", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { voucherId } = req.body;

    // Get voucher details
    const [voucherRows] = await promisePool.query(
      "SELECT * FROM vouchers WHERE id = ?",
      [voucherId]
    );

    if (voucherRows.length === 0) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    const voucher = voucherRows[0];

    // Get user details to check points
    const [userRows] = await promisePool.query(
      "SELECT * FROM users WHERE userId = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRows[0];

    // Check if user has enough points
    if (user.points < voucher.pointsCost) {
      return res.status(400).json({ error: "Not enough points" });
    }

    // Check eligibility
    if (
      voucher.eligibility !== "all" &&
      user.membershipType.toLowerCase() !== voucher.eligibility.toLowerCase()
    ) {
      return res.status(400).json({ error: "Not eligible for this voucher" });
    }

    // Create expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Add voucher to user's redeemed vouchers
    const userVoucher = {
      userId: userId,
      voucherId: voucherId,
      isRedeemed: false,
      expiryDate: expiryDate,
    };

    await promisePool.query("INSERT INTO user_vouchers SET ?", userVoucher);

    // Deduct points from user
    await promisePool.query(
      "UPDATE users SET points = points - ? WHERE userId = ?",
      [voucher.pointsCost, userId]
    );

    // Record point deduction
    const pointDeduction = {
      userId: userId,
      points: -voucher.pointsCost,
      reason: `Redeemed ${voucher.title}`,
    };

    await promisePool.query("INSERT INTO xp_history SET ?", pointDeduction);

    res.status(201).json({
      success: true,
      message: "Voucher redeemed successfully",
      voucherDetails: {
        id: voucher.id,
        title: voucher.title,
        discount: voucher.discount,
        pointsCost: voucher.pointsCost,
        expiryDate: expiryDate,
      },
    });
  } catch (err) {
    console.error("Error redeeming voucher:", err);
    res.status(500).json({ error: "Failed to redeem voucher" });
  }
});

// GET user's XP points
app.get("/api/profile/:userId/xp", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get total XP
    const [rows] = await promisePool.query(
      "SELECT SUM(points) as totalXP FROM xp_history WHERE userId = ?",
      [userId]
    );

    // Get XP history
    const [historyRows] = await promisePool.query(
      "SELECT * FROM xp_history WHERE userId = ? ORDER BY timestamp DESC LIMIT 10",
      [userId]
    );

    const xpHistory = historyRows.map((item) => ({
      id: item.id,
      points: item.points,
      reason: item.reason,
      date: item.timestamp,
    }));

    res.json({
      totalXP: rows[0].totalXP || 0,
      history: xpHistory,
    });
  } catch (err) {
    console.error("Error fetching XP data:", err);
    res.status(500).json({ error: "Failed to fetch XP data" });
  }
});

// Update user profile
app.put("/api/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, handle, location, phone, email, gender, nativeLanguage } =
      req.body;

    const updatedUser = {
      name,
      handle,
      location,
      phone,
      email,
      gender,
      nativeLanguage,
    };

    await promisePool.query("UPDATE users SET ? WHERE userId = ?", [
      updatedUser,
      userId,
    ]);

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Logout route (just for tracking purposes)
app.post("/api/logout", (req, res) => {
  // In a real application, you would invalidate the session/token here
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Initialize database on startup
initializeDatabase();

// Start the server
app.listen(PORT, () => {
  console.log(`Profile server running on port ${PORT}`);
});

// Error handling for unexpected errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
