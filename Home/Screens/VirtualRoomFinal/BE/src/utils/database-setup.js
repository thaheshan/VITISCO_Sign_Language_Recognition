import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { logger } from "./logger.js"

dotenv.config()

async function setupDatabase() {
  let connection

  try {
    // Create connection to MySQL server
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    })

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`)

    logger.info(`Database ${process.env.DB_NAME} created or already exists`)

    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME}`)

    // Create tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_code VARCHAR(10) NOT NULL UNIQUE,
        created_by VARCHAR(50) NOT NULL,
        status ENUM('waiting', 'playing', 'finished') DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        player_id VARCHAR(50) NOT NULL,
        is_host BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )
    `)

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_text VARCHAR(255) NOT NULL,
        option_a VARCHAR(100) NOT NULL,
        option_b VARCHAR(100) NOT NULL,
        option_c VARCHAR(100) NOT NULL,
        option_d VARCHAR(100) NOT NULL,
        correct_option VARCHAR(100) NOT NULL,
        video_url VARCHAR(255) NOT NULL,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium'
      )
    `)

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS game_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        player_id VARCHAR(50) NOT NULL,
        score INT NOT NULL DEFAULT 0,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )
    `)

    logger.info("All tables created successfully")

    // Insert sample questions if the questions table is empty
    const [rows] = await connection.execute("SELECT COUNT(*) as count FROM questions")

    if (rows[0].count === 0) {
      await insertSampleQuestions(connection)
      logger.info("Sample questions inserted successfully")
    }

    logger.info("Database setup completed successfully")
  } catch (error) {
    logger.error("Error setting up database:", error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

async function insertSampleQuestions(connection) {
  const questions = [
    {
      question_text: 'What is the sign for "Hello"?',
      option_a: "Wave hand",
      option_b: "Touch forehead",
      option_c: "Cross arms",
      option_d: "Point up",
      correct_option: "Wave hand",
      video_url: "/signs/hello.mp4",
      difficulty: "easy",
    },
    {
      question_text: 'What is the sign for "Thank you"?',
      option_a: "Thumbs up",
      option_b: "Hand from chin forward",
      option_c: "Clap hands",
      option_d: "Tap chest",
      correct_option: "Hand from chin forward",
      video_url: "/signs/thank-you.mp4",
      difficulty: "easy",
    },
    {
      question_text: 'What is the sign for "Sorry"?',
      option_a: "Shake head",
      option_b: "Cross arms",
      option_c: "Fist circular motion on chest",
      option_d: "Hand on heart",
      correct_option: "Fist circular motion on chest",
      video_url: "/signs/sorry.mp4",
      difficulty: "medium",
    },
    {
      question_text: 'What is the sign for "Friend"?',
      option_a: "Linked index fingers",
      option_b: "Handshake motion",
      option_c: "Two hands meeting",
      option_d: "Thumbs up",
      correct_option: "Linked index fingers",
      video_url: "/signs/friend.mp4",
      difficulty: "medium",
    },
    {
      question_text: 'What is the sign for "Love"?',
      option_a: "Heart shape with hands",
      option_b: "Cross arms over chest",
      option_c: "Point to heart",
      option_d: "Hands crossed at wrists on chest",
      correct_option: "Hands crossed at wrists on chest",
      video_url: "/signs/love.mp4",
      difficulty: "easy",
    },
    {
      question_text: 'What is the sign for "Help"?',
      option_a: "Waving hands",
      option_b: "Thumbs down",
      option_c: "Closed fist on open palm",
      option_d: "Raising hand",
      correct_option: "Closed fist on open palm",
      video_url: "/signs/help.mp4",
      difficulty: "medium",
    },
    {
      question_text: 'What is the sign for "Yes"?',
      option_a: "Thumbs up",
      option_b: "Nodding head",
      option_c: "Fist nodding",
      option_d: "Open hand up and down",
      correct_option: "Fist nodding",
      video_url: "/signs/yes.mp4",
      difficulty: "easy",
    },
    {
      question_text: 'What is the sign for "No"?',
      option_a: "Shake head",
      option_b: "Thumbs down",
      option_c: "Index finger wagging",
      option_d: "Hand in stop motion",
      correct_option: "Index finger wagging",
      video_url: "/signs/no.mp4",
      difficulty: "easy",
    },
  ]

  for (const question of questions) {
    await connection.execute(
      `
      INSERT INTO questions 
      (question_text, option_a, option_b, option_c, option_d, correct_option, video_url, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        question.question_text,
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d,
        question.correct_option,
        question.video_url,
        question.difficulty,
      ],
    )
  }
}

// Run the setup
setupDatabase().catch(console.error)

