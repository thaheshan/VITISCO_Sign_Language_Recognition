// server.js - Main entry point for the Language Learning Task Manager API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const morgan = require('morgan');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '34.67.39.101',
  user: process.env.DB_USER || 'admin123',
  password: process.env.DB_PASSWORD || 'vitisco123',
  database: process.env.DB_NAME || 'vitisco',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


const CLOUD_API_URL = "https://backend-59-dot-future-champion-452808-r4.uw.r.appspot.com/";


const getApiUrl = () => {
  // For Expo Go, use your computer's local network IP as a fallback
  const LOCAL_API_URL = "http://192.168.58.40:5000/api";
  
  // Alternative approach using Expo's manifest.debuggerHost (if available)
  // This works in some Expo environments but not all
  /*
  if (Constants.manifest?.debuggerHost) {
    // Extract the IP address from the debuggerHost 
    const hostIP = Constants.manifest.debuggerHost.split(':')[0];
    return `http://${hostIP}:5000/api`;
  }
  */
  
  return { cloud: CLOUD_API_URL, local: LOCAL_API_URL };
};
// Make API URL available to routes
app.locals.apiUrl = getApiUrl();

// Test database connection with better error handling
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Please check your .env file for correct database credentials');
    console.error('Required environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    process.exit(1);
  }
}

testConnection();

// =============================================================================
// DATABASE INITIALIZATION - Run on first start or for migrations
// =============================================================================
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create user_profiles table - Fixed the missing default values for target_language and native_language
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        vocabulary_progress INT DEFAULT 0,
        grammar_progress INT DEFAULT 0,
        listening_progress INT DEFAULT 0,
        speaking_progress INT DEFAULT 0,
        reading_progress INT DEFAULT 0,
        overall_progress INT DEFAULT 0,
        target_language VARCHAR(50) DEFAULT 'English',
        native_language VARCHAR(50) DEFAULT 'English',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create tasks table - Fixed the task table schema, renamed date and time fields to avoid reserved word conflicts
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        task_date DATE NOT NULL,
        task_time TIME NOT NULL,
        reminder_minutes INT DEFAULT 15,
        progress ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
        notification_id VARCHAR(255),
        suggested_task_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create suggested_tasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS suggested_tasks (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default suggested tasks if none exist
    const [existingTasks] = await connection.query('SELECT COUNT(*) as count FROM suggested_tasks');
    
    if (existingTasks[0].count === 0) {
      await connection.query(`
        INSERT INTO suggested_tasks (id, title, description, type, difficulty) VALUES
        ('vocab_food', 'Vocabulary Practice: Food', 'Learn and practice common food vocabulary', 'vocabulary', 'Beginner'),
        ('grammar_past', 'Grammar: Past Tense', 'Practice forming and using past tense verbs', 'grammar', 'Intermediate'),
        ('listening', 'Listening Exercise: Conversations', 'Listen to and comprehend everyday conversations', 'listening', 'Beginner'),
        ('speaking', 'Speaking Practice: Introductions', 'Practice introducing yourself and asking basic questions', 'speaking', 'Beginner'),
        ('reading', 'Reading: Short Stories', 'Read and comprehend short stories with basic vocabulary', 'reading', 'Intermediate')
      `);
    }
    
    // Insert a test user if none exist
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count === 0) {
      // In production, you would hash passwords
      const [result] = await connection.query(`
        INSERT INTO users (username, email, password) VALUES
        ('testuser', 'test@example.com', 'password123')
      `);
      
      const userId = result.insertId;
      
      // Create profile for test user
      await connection.query(`
        INSERT INTO user_profiles 
        (user_id, vocabulary_progress, grammar_progress, listening_progress, speaking_progress, reading_progress, overall_progress, target_language, native_language) 
        VALUES (?, 0, 0, 0, 0, 0, 0, 'Spanish', 'English')
      `, [userId]);
    }
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Run initialization
initializeDatabase();

// =============================================================================
// API ROUTES
// =============================================================================

// Default user ID (for demo purposes - in production you would use authentication)
const DEFAULT_USER_ID = 1;

// Helper function to validate date format (YYYY-MM-DD)
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Helper function to validate time format (HH:MM)
function isValidTime(timeString) {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeString);
}

// Add endpoint to get API URL
app.get('/api-url', (req, res) => {
  res.status(200).json({ apiUrl: app.locals.apiUrl });
});

// =============================================================================
// USER ROUTES
// =============================================================================

// Get user profile
app.get('/user/profile', async (req, res) => {
  try {
    const [profiles] = await pool.query(`
      SELECT 
        u.username,
        p.vocabulary_progress,
        p.grammar_progress,
        p.listening_progress,
        p.speaking_progress,
        p.reading_progress,
        p.overall_progress,
        p.target_language,
        p.native_language
      FROM user_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `, [DEFAULT_USER_ID]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Generate personalized recommendations based on progress
    const profile = profiles[0];
    const recommendations = [];
    
    // Add recommendations based on lowest progress areas
    if (profile.listening_progress < 50) {
      recommendations.push('Listening exercises would help improve your comprehension');
    }
    
    if (profile.speaking_progress < 60) {
      recommendations.push('Regular speaking practice is recommended to improve fluency');
    }
    
    if (profile.vocabulary_progress < 70) {
      recommendations.push('Focus on expanding your vocabulary with daily practice');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue with regular practice in all language areas');
    }
    
    // Add recommendations to the response
    profile.recommendations = recommendations;
    
    // Add API base URL to response
    profile.apiUrl = app.locals.apiUrl;
    
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
app.put('/user/profile', async (req, res) => {
  try {
    const { 
      vocabulary_progress, 
      grammar_progress, 
      listening_progress, 
      speaking_progress, 
      reading_progress,
      target_language,
      native_language
    } = req.body;
    
    // Calculate overall progress
    const overall_progress = Math.round(
      (vocabulary_progress + grammar_progress + listening_progress + speaking_progress + reading_progress) / 5
    );
    
    await pool.query(`
      UPDATE user_profiles SET
        vocabulary_progress = ?,
        grammar_progress = ?,
        listening_progress = ?,
        speaking_progress = ?,
        reading_progress = ?,
        overall_progress = ?,
        target_language = ?,
        native_language = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [
      vocabulary_progress, 
      grammar_progress, 
      listening_progress, 
      speaking_progress, 
      reading_progress,
      overall_progress,
      target_language,
      native_language,
      DEFAULT_USER_ID
    ]);
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      overall_progress,
      apiUrl: app.locals.apiUrl
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// =============================================================================
// TASK ROUTES
// =============================================================================

// Get all tasks for user
app.get('/tasks', async (req, res) => {
  try {
    const [tasks] = await pool.query(`
      SELECT 
        id,
        title,
        description,
        DATE_FORMAT(task_date, '%Y-%m-%d') as date,
        TIME_FORMAT(task_time, '%H:%i') as time,
        reminder_minutes,
        progress,
        notification_id,
        suggested_task_id
      FROM tasks
      WHERE user_id = ?
      ORDER BY task_date ASC, task_time ASC
    `, [DEFAULT_USER_ID]);
    
    // Add API URL to response metadata
    res.status(200).json({
      apiUrl: app.locals.apiUrl,
      tasks: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tasks for a specific date
app.get('/tasks/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD' });
    }
    
    const [tasks] = await pool.query(`
      SELECT 
        id,
        title,
        description,
        DATE_FORMAT(task_date, '%Y-%m-%d') as date,
        TIME_FORMAT(task_time, '%H:%i') as time,
        reminder_minutes,
        progress,
        notification_id,
        suggested_task_id
      FROM tasks
      WHERE user_id = ? AND task_date = ?
      ORDER BY task_time ASC
    `, [DEFAULT_USER_ID, date]);
    
    // Add API URL to response metadata
    res.status(200).json({
      apiUrl: app.locals.apiUrl,
      tasks: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks for date:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific task
app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tasks] = await pool.query(`
      SELECT 
        id,
        title,
        description,
        DATE_FORMAT(task_date, '%Y-%m-%d') as date,
        TIME_FORMAT(task_time, '%H:%i') as time,
        reminder_minutes,
        progress,
        notification_id,
        suggested_task_id
      FROM tasks
      WHERE id = ? AND user_id = ?
    `, [id, DEFAULT_USER_ID]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Add API URL to response
    const task = tasks[0];
    task.apiUrl = app.locals.apiUrl;
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      time, 
      reminderMinutes, 
      progress = 'Not Started', 
      notificationId = null,
      suggestedTaskId = null
    } = req.body;
    
    // Validate required fields
    if (!title || !date || !time) {
      return res.status(400).json({ message: 'Title, date, and time are required' });
    }
    
    // Validate date format
    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD' });
    }
    
    // Validate time format
    if (!isValidTime(time)) {
      return res.status(400).json({ message: 'Invalid time format. Please use HH:MM' });
    }
    
    const [result] = await pool.query(`
      INSERT INTO tasks 
      (user_id, title, description, task_date, task_time, reminder_minutes, progress, notification_id, suggested_task_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      DEFAULT_USER_ID,
      title,
      description || null,
      date,
      time,
      reminderMinutes || 15,
      progress,
      notificationId,
      suggestedTaskId
    ]);
    
    const taskId = result.insertId;
    
    // Fetch the created task to return
    const [tasks] = await pool.query(`
      SELECT 
        id,
        title,
        description,
        DATE_FORMAT(task_date, '%Y-%m-%d') as date,
        TIME_FORMAT(task_time, '%H:%i') as time,
        reminder_minutes,
        progress,
        notification_id,
        suggested_task_id
      FROM tasks
      WHERE id = ?
    `, [taskId]);
    
    // Add API URL to response
    const task = tasks[0];
    task.apiUrl = app.locals.apiUrl;
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      date, 
      time, 
      reminderMinutes, 
      progress,
      notificationId
    } = req.body;
    
    // Build dynamic query based on provided fields
    let updateQuery = 'UPDATE tasks SET updated_at = CURRENT_TIMESTAMP';
    const params = [];
    
    if (title !== undefined) {
      updateQuery += ', title = ?';
      params.push(title);
    }
    
    if (description !== undefined) {
      updateQuery += ', description = ?';
      params.push(description);
    }
    
    if (date !== undefined) {
      if (!isValidDate(date)) {
        return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD' });
      }
      updateQuery += ', task_date = ?';
      params.push(date);
    }
    
    if (time !== undefined) {
      if (!isValidTime(time)) {
        return res.status(400).json({ message: 'Invalid time format. Please use HH:MM' });
      }
      updateQuery += ', task_time = ?';
      params.push(time);
    }
    
    if (reminderMinutes !== undefined) {
      updateQuery += ', reminder_minutes = ?';
      params.push(reminderMinutes);
    }
    
    if (progress !== undefined) {
      updateQuery += ', progress = ?';
      params.push(progress);
    }
    
    if (notificationId !== undefined) {
      updateQuery += ', notification_id = ?';
      params.push(notificationId);
    }
    
    updateQuery += ' WHERE id = ? AND user_id = ?';
    params.push(id, DEFAULT_USER_ID);
    
    const [result] = await pool.query(updateQuery, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to update it' });
    }
    
    // Fetch updated task
    const [tasks] = await pool.query(`
      SELECT 
        id,
        title,
        description,
        DATE_FORMAT(task_date, '%Y-%m-%d') as date,
        TIME_FORMAT(task_time, '%H:%i') as time,
        reminder_minutes,
        progress,
        notification_id,
        suggested_task_id
      FROM tasks
      WHERE id = ?
    `, [id]);
    
    // Add API URL to response
    const task = tasks[0];
    task.apiUrl = app.locals.apiUrl;
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, DEFAULT_USER_ID]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to delete it' });
    }
    
    res.status(200).json({ 
      message: 'Task deleted successfully',
      apiUrl: app.locals.apiUrl
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// =============================================================================
// SUGGESTED TASKS ROUTES
// =============================================================================

// Get all suggested tasks
app.get('/suggested-tasks', async (req, res) => {
  try {
    const [tasks] = await pool.query(`
      SELECT id, title, description, type, difficulty
      FROM suggested_tasks
      ORDER BY type, title
    `);
    
    // Add API URL to response metadata
    res.status(200).json({
      apiUrl: app.locals.apiUrl,
      suggestedTasks: tasks
    });
  } catch (error) {
    console.error('Error fetching suggested tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get suggested tasks by type
app.get('/suggested-tasks/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    const [tasks] = await pool.query(`
      SELECT id, title, description, type, difficulty
      FROM suggested_tasks
      WHERE type = ?
      ORDER BY title
    `, [type]);
    
    // Add API URL to response metadata
    res.status(200).json({
      apiUrl: app.locals.apiUrl,
      suggestedTasks: tasks
    });
  } catch (error) {
    console.error('Error fetching suggested tasks by type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get suggested tasks by difficulty
app.get('/suggested-tasks/difficulty/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty level. Must be one of: Beginner, Intermediate, Advanced' });
    }
    
    const [tasks] = await pool.query(`
      SELECT id, title, description, type, difficulty
      FROM suggested_tasks
      WHERE difficulty = ?
      ORDER BY type, title
    `, [difficulty]);
    
    // Add API URL to response metadata
    res.status(200).json({
      apiUrl: app.locals.apiUrl,
      suggestedTasks: tasks
    });
  } catch (error) {
    console.error('Error fetching suggested tasks by difficulty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// =============================================================================
// STATS ROUTES
// =============================================================================

// Get task completion stats
app.get('/stats/completion', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN progress = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN progress = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN progress = 'Not Started' THEN 1 ELSE 0 END) as not_started_tasks
      FROM tasks
      WHERE user_id = ?
    `, [DEFAULT_USER_ID]);
    
    const completionStats = stats[0];
    
    // Calculate percentages
    const totalTasks = completionStats.total_tasks;
    if (totalTasks > 0) {
      completionStats.completion_rate = Math.round((completionStats.completed_tasks / totalTasks) * 100);
      completionStats.in_progress_rate = Math.round((completionStats.in_progress_tasks / totalTasks) * 100);
      completionStats.not_started_rate = Math.round((completionStats.not_started_tasks / totalTasks) * 100);
    } else {
      completionStats.completion_rate = 0;
      completionStats.in_progress_rate = 0;
      completionStats.not_started_rate = 0;
    }
    
    // Add API URL to response
    completionStats.apiUrl = app.locals.apiUrl;
    
    res.status(200).json(completionStats);
  } catch (error) {
    console.error('Error fetching completion stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get task type distribution
app.get('/stats/task-types', async (req, res) => {
  try {
    // This query joins with suggested_tasks to get the type for each task
    const [stats] = await pool.query(`
      SELECT 
        COALESCE(st.type, 'custom') as task_type,
        COUNT(*) as count
      FROM tasks t
      LEFT JOIN suggested_tasks st ON t.suggested_task_id = st.id
      WHERE t.user_id = ?
      GROUP BY COALESCE(st.type, 'custom')
      ORDER BY count DESC
    `, [DEFAULT_USER_ID]);
    
    // Add API URL to response metadata
    res.status(200).json({
      apiUrl: app.locals.apiUrl,
      taskTypes: stats
    });
  } catch (error) {
    console.error('Error fetching task type stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: ${app.locals.apiUrl}`);
});

module.exports = app;


