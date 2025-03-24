// server.js - Complete Language Learning App Backend (MySQL version)
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const scheduler = require('node-schedule');
const moment = require('moment');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MySQL Database Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || "34.67.39.101",
  user: process.env.DB_USER || "admin123",
  password: process.env.DB_PASSWORD || "vitisco123",
  database: process.env.DB_NAME || "vitisco",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize Database Tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        target_language VARCHAR(255) NOT NULL,
        proficiency_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        fcm_token VARCHAR(255),
        notification_email BOOLEAN DEFAULT TRUE,
        notification_push BOOLEAN DEFAULT TRUE,
        notification_sms BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tasks Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category ENUM('vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'writing', 'custom') NOT NULL,
        task_date DATE NOT NULL,
        task_time TIME NOT NULL,
        reminder_minutes INT DEFAULT 15,
        progress ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Progress Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        progress_date DATE NOT NULL,
        vocabulary_progress INT DEFAULT 0,
        grammar_progress INT DEFAULT 0,
        listening_progress INT DEFAULT 0,
        speaking_progress INT DEFAULT 0,
        reading_progress INT DEFAULT 0,
        writing_progress INT DEFAULT 0,
        overall_progress INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, progress_date)
      )
    `);
    
    // Feedback Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        task_id INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        difficulty ENUM('Too Easy', 'Just Right', 'Too Difficult') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);
    
    // Reminders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        task_id INT NOT NULL,
        scheduled_time DATETIME NOT NULL,
        sent BOOLEAN DEFAULT FALSE,
        method_email BOOLEAN DEFAULT TRUE,
        method_push BOOLEAN DEFAULT TRUE,
        method_sms BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Initialize Firebase for Push Notifications (if needed)
if (process.env.FIREBASE_CREDENTIALS) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Configure email service for reminders
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ======================
// MIDDLEWARE
// ======================

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'languagelearningsecret');
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ======================
// HELPER FUNCTIONS
// ======================

// Calculate category progress
async function calculateCategoryProgress(userId, category) {
  try {
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE user_id = ? AND category = ?',
      [userId, category]
    );
    
    if (tasks.length === 0) return 0;
    
    const [completedTasks] = await pool.query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND category = ? AND progress = ?',
      [userId, category, 'Completed']
    );
    
    return Math.round((completedTasks[0].count / tasks.length) * 100);
  } catch (error) {
    console.error('Error calculating category progress:', error);
    throw error;
  }
}

// Send email reminder
async function sendEmailReminder(user, task) {
  if (!user.email || !process.env.EMAIL_USER) return;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Reminder: ${task.title}`,
    html: `
      <h2>Language Learning Reminder</h2>
      <p>This is a reminder for your scheduled learning task:</p>
      <p><strong>${task.title}</strong></p>
      <p><strong>Time:</strong> ${task.task_time}</p>
      <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
      <p>Keep up the good work with your language learning journey!</p>
    `
  };
  
  try {
    await emailTransporter.sendMail(mailOptions);
    console.log(`Email reminder sent to ${user.email} for task ${task.title}`);
  } catch (error) {
    console.error('Error sending email reminder:', error);
  }
}

// Send push notification
async function sendPushNotification(user, task) {
  if (!user.fcm_token || !admin) return;
  
  const message = {
    notification: {
      title: 'Language Learning Reminder',
      body: `Time for: ${task.title}`
    },
    data: {
      taskId: task.id.toString(),
      category: task.category,
      click_action: 'OPEN_TASK_DETAILS'
    },
    token: user.fcm_token
  };
  
  try {
    await admin.messaging().send(message);
    console.log(`Push notification sent to user ${user.id} for task ${task.title}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// Update user progress based on completed task
async function updateProgressForCompletedTask(userId, task) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const today = moment().format('YYYY-MM-DD');
    
    // Check if progress record exists for today
    const [existingProgress] = await connection.query(
      'SELECT * FROM progress WHERE user_id = ? AND progress_date = ?',
      [userId, today]
    );
    
    let progressId;
    
    // If no record exists, create one with baseline values
    if (existingProgress.length === 0) {
      // Get the most recent progress record to use as baseline
      const [lastProgress] = await connection.query(
        'SELECT * FROM progress WHERE user_id = ? ORDER BY progress_date DESC LIMIT 1',
        [userId]
      );
      
      let baseProgress = {
        vocabulary_progress: 0,
        grammar_progress: 0,
        listening_progress: 0,
        speaking_progress: 0,
        reading_progress: 0,
        writing_progress: 0,
        overall_progress: 0
      };
      
      // Use last progress values if available
      if (lastProgress.length > 0) {
        baseProgress = {
          vocabulary_progress: lastProgress[0].vocabulary_progress,
          grammar_progress: lastProgress[0].grammar_progress,
          listening_progress: lastProgress[0].listening_progress,
          speaking_progress: lastProgress[0].speaking_progress,
          reading_progress: lastProgress[0].reading_progress,
          writing_progress: lastProgress[0].writing_progress,
          overall_progress: lastProgress[0].overall_progress
        };
      }
      
      // Insert new progress record
      const [result] = await connection.query(
        'INSERT INTO progress (user_id, progress_date, vocabulary_progress, grammar_progress, listening_progress, speaking_progress, reading_progress, writing_progress, overall_progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId, today, 
          baseProgress.vocabulary_progress, 
          baseProgress.grammar_progress, 
          baseProgress.listening_progress, 
          baseProgress.speaking_progress, 
          baseProgress.reading_progress, 
          baseProgress.writing_progress, 
          baseProgress.overall_progress
        ]
      );
      
      progressId = result.insertId;
    } else {
      progressId = existingProgress[0].id;
    }
    
    // Increment progress in the relevant category (between 2-5 points)
    const incrementValue = Math.floor(Math.random() * 4) + 2;
    
    // Get current progress values
    const [currentProgress] = await connection.query(
      'SELECT * FROM progress WHERE id = ?',
      [progressId]
    );
    
    const progress = currentProgress[0];
    
    // Update the specific category based on task
    let fieldToUpdate;
    switch (task.category) {
      case 'vocabulary':
        fieldToUpdate = 'vocabulary_progress';
        break;
      case 'grammar':
        fieldToUpdate = 'grammar_progress';
        break;
      case 'listening':
        fieldToUpdate = 'listening_progress';
        break;
      case 'speaking':
        fieldToUpdate = 'speaking_progress';
        break;
      case 'reading':
        fieldToUpdate = 'reading_progress';
        break;
      case 'writing':
        fieldToUpdate = 'writing_progress';
        break;
      default:
        // For custom tasks, increment a random category
        const categories = ['vocabulary_progress', 'grammar_progress', 'listening_progress', 
                            'speaking_progress', 'reading_progress', 'writing_progress'];
        fieldToUpdate = categories[Math.floor(Math.random() * categories.length)];
    }
    
    // Calculate new value ensuring it doesn't exceed 100
    const newValue = Math.min(100, progress[fieldToUpdate] + incrementValue);
    
    // Update the specific field
    await connection.query(
      `UPDATE progress SET ${fieldToUpdate} = ? WHERE id = ?`,
      [newValue, progressId]
    );
    
    // Recalculate overall progress (average of all categories)
    const [updatedProgress] = await connection.query(
      'SELECT * FROM progress WHERE id = ?',
      [progressId]
    );
    
    const up = updatedProgress[0];
    const overallProgress = Math.round(
      (up.vocabulary_progress + 
       up.grammar_progress + 
       up.listening_progress + 
       up.speaking_progress + 
       up.reading_progress + 
       up.writing_progress) / 6
    );
    
    // Update overall progress
    await connection.query(
      'UPDATE progress SET overall_progress = ? WHERE id = ?',
      [overallProgress, progressId]
    );
    
    await connection.commit();
    
    const [finalProgress] = await connection.query(
      'SELECT * FROM progress WHERE id = ?',
      [progressId]
    );
    
    connection.release();
    return finalProgress[0];
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error updating progress:', error);
    throw error;
  }
}

// Create reminder for task
async function createReminderForTask(task) {
  try {
    // Get task time components
    const taskTime = task.task_time;
    
    // Create reminder date
    const taskDate = new Date(task.task_date);
    const timeArray = taskTime.split(':');
    
    // Set hours and minutes, accounting for reminder time
    const reminderDate = new Date(taskDate);
    reminderDate.setHours(parseInt(timeArray[0]), parseInt(timeArray[1]) - task.reminder_minutes, 0, 0);
    
    // Don't create reminder if the time has already passed
    if (reminderDate < new Date()) {
      console.log('Reminder time has already passed, not creating reminder');
      return null;
    }
    
    // Get user notification preferences
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [task.user_id]
    );
    
    if (users.length === 0) {
      console.log(`User ${task.user_id} not found, not creating reminder`);
      return null;
    }
    
    const user = users[0];
    
    // Create the reminder
    const [result] = await pool.query(
      'INSERT INTO reminders (user_id, task_id, scheduled_time, method_email, method_push, method_sms) VALUES (?, ?, ?, ?, ?, ?)',
      [
        task.user_id,
        task.id,
        reminderDate,
        user.notification_email,
        user.notification_push,
        user.notification_sms
      ]
    );
    
    console.log(`Reminder created for task ${task.title} at ${reminderDate}`);
    
    // Return the created reminder
    const [reminders] = await pool.query(
      'SELECT * FROM reminders WHERE id = ?',
      [result.insertId]
    );
    
    return reminders[0];
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
}

// Update reminder for task
async function updateReminderForTask(task) {
  try {
    // Delete existing reminders for this task
    await pool.query(
      'DELETE FROM reminders WHERE task_id = ?',
      [task.id]
    );
    
    // Create new reminder
    return await createReminderForTask(task);
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
}

// Process pending reminders
async function processReminders() {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    // Find reminders that are due but haven't been sent
    const [dueReminders] = await pool.query(
      'SELECT * FROM reminders WHERE scheduled_time <= ? AND scheduled_time >= ? AND sent = FALSE',
      [fiveMinutesFromNow, now]
    );
    
    console.log(`Processing ${dueReminders.length} pending reminders`);
    
    for (const reminder of dueReminders) {
      // Get task info
      const [tasks] = await pool.query(
        'SELECT * FROM tasks WHERE id = ?',
        [reminder.task_id]
      );
      
      // Get user info
      const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [reminder.user_id]
      );
      
      if (tasks.length === 0 || users.length === 0) {
        console.log(`Task or user not found for reminder ${reminder.id}`);
        await pool.query(
          'UPDATE reminders SET sent = TRUE WHERE id = ?',
          [reminder.id]
        );
        continue;
      }
      
      const task = tasks[0];
      const user = users[0];
      
      // Send reminders based on user preferences
      if (reminder.method_email && user.notification_email) {
        await sendEmailReminder(user, task);
      }
      
      if (reminder.method_push && user.notification_push) {
        await sendPushNotification(user, task);
      }
      
      // Mark reminder as sent
      await pool.query(
        'UPDATE reminders SET sent = TRUE WHERE id = ?',
        [reminder.id]
      );
      
      console.log(`Reminder processed for task: ${task.title}`);
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
}

// ======================
// ROUTES
// ======================

// --------- Authentication Routes ---------

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { username, email, password, targetLanguage, proficiencyLevel } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const [result] = await connection.query(
      'INSERT INTO users (username, email, password, target_language, proficiency_level) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, targetLanguage, proficiencyLevel]
    );
    
    const userId = result.insertId;
    
    await connection.commit();
    
    // Generate JWT
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'languagelearningsecret', {
      expiresIn: '7d'
    });
    
    // Get the created user (without password)
    const [users] = await connection.query(
      'SELECT id, username, email, target_language, proficiency_level FROM users WHERE id = ?',
      [userId]
    );
    
    connection.release();
    
    res.status(201).json({
      token,
      user: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        targetLanguage: users[0].target_language,
        proficiencyLevel: users[0].proficiency_level
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'languagelearningsecret', {
      expiresIn: '7d'
    });
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        targetLanguage: user.target_language,
        proficiencyLevel: user.proficiency_level
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, target_language, proficiency_level, fcm_token, notification_email, notification_push, notification_sms, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      targetLanguage: user.target_language,
      proficiencyLevel: user.proficiency_level,
      fcmToken: user.fcm_token,
      notificationPreferences: {
        email: user.notification_email,
        push: user.notification_push,
        sms: user.notification_sms
      },
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { username, targetLanguage, proficiencyLevel, notificationPreferences, fcmToken } = req.body;
    
    let updateFields = [];
    let queryParams = [];
    
    if (username) {
      updateFields.push('username = ?');
      queryParams.push(username);
    }
    
    if (targetLanguage) {
      updateFields.push('target_language = ?');
      queryParams.push(targetLanguage);
    }
    
    if (proficiencyLevel) {
      updateFields.push('proficiency_level = ?');
      queryParams.push(proficiencyLevel);
    }
    
    if (notificationPreferences) {
      updateFields.push('notification_email = ?');
      queryParams.push(notificationPreferences.email);
      
      updateFields.push('notification_push = ?');
      queryParams.push(notificationPreferences.push);
      
      updateFields.push('notification_sms = ?');
      queryParams.push(notificationPreferences.sms);
    }
    
    if (fcmToken) {
      updateFields.push('fcm_token = ?');
      queryParams.push(fcmToken);
    }
    
    // Add user id to params
    queryParams.push(req.user.id);
    
    // Update user
    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    );
    
    // Get updated user
    const [users] = await pool.query(
      'SELECT id, username, email, target_language, proficiency_level, fcm_token, notification_email, notification_push, notification_sms, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      targetLanguage: user.target_language,
      proficiencyLevel: user.proficiency_level,
      fcmToken: user.fcm_token,
      notificationPreferences: {
        email: user.notification_email,
        push: user.notification_push,
        sms: user.notification_sms
      },
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --------- Task Routes ---------

// Create a new task
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, date, time, reminderMinutes } = req.body;
    
    // Create new task
    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, title, description, category, task_date, task_time, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description, category, date, time, reminderMinutes]
    );
    
    const taskId = result.insertId;
    
    // Get the created task
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );
    
    const task = tasks[0];
    
    // Create reminder for this task
    await createReminderForTask(task);
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tasks for a user
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY task_date ASC, task_time ASC',
      [req.user.id]
    );
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks for a specific date
app.get('/api/tasks/date/:date', authMiddleware, async (req, res) => {
  try {
    const dateStr = req.params.date;
    
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE user_id = ? AND task_date = ? ORDER BY task_time ASC',
      [req.user.id, dateStr]
    );
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by date error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific task by ID
app.get('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(tasks[0]);
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, date, time, reminderMinutes } = req.body;
    
    // Update task
    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, description = ?, category = ?, task_date = ?, task_time = ?, reminder_minutes = ? WHERE id = ? AND user_id = ?',
      [title, description, category, date, time, reminderMinutes, req.params.id, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get updated task
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [req.params.id]
    );
    
    const task = tasks[0];
    
    // Update reminder for this task
    await updateReminderForTask(task);
    
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task progress status
app.put('/api/tasks/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (!['Not Started', 'In Progress', 'Completed'].includes(progress)) {
      return res.status(400).json({ message: 'Invalid progress status' });
    }
    
    // Update task progress
    const [result] = await pool.query(
      'UPDATE tasks SET progress = ? WHERE id = ? AND user_id = ?',
      [progress, req.params.id, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get updated task
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [req.params.id]
    );
    
    const task = tasks[0];
    
    // If task is completed, update user progress
    if (progress === 'Completed') {
      await updateProgressForCompletedTask(req.user.id, task);
    }
    
    res.json(task);
  } catch (error) {
    console.error('Update task progress error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Delete a task
  app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
      // Delete associated reminders first
      await pool.query(
        'DELETE FROM reminders WHERE task_id = ?',
        [req.params.id]
      );
      
      // Delete task
      const [result] = await pool.query(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // --------- Progress Routes ---------
  
  // Get user's progress
  app.get('/api/progress', authMiddleware, async (req, res) => {
    try {
      // Get the most recent progress entry
      const [progress] = await pool.query(
        'SELECT * FROM progress WHERE user_id = ? ORDER BY progress_date DESC LIMIT 1',
        [req.user.id]
      );
      
      if (progress.length === 0) {
        return res.json({
          overallProgress: 0,
          categories: {
            vocabulary: 0,
            grammar: 0,
            listening: 0,
            speaking: 0,
            reading: 0,
            writing: 0
          }
        });
      }
      
      const latestProgress = progress[0];
      
      res.json({
        overallProgress: latestProgress.overall_progress,
        categories: {
          vocabulary: latestProgress.vocabulary_progress,
          grammar: latestProgress.grammar_progress,
          listening: latestProgress.listening_progress,
          speaking: latestProgress.speaking_progress,
          reading: latestProgress.reading_progress,
          writing: latestProgress.writing_progress
        },
        date: latestProgress.progress_date
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get progress history (past 30 days)
  app.get('/api/progress/history', authMiddleware, async (req, res) => {
    try {
      const days = req.query.days || 30;
      const startDate = moment().subtract(days, 'days').format('YYYY-MM-DD');
      
      const [progressHistory] = await pool.query(
        'SELECT * FROM progress WHERE user_id = ? AND progress_date >= ? ORDER BY progress_date ASC',
        [req.user.id, startDate]
      );
      
      const formattedHistory = progressHistory.map(entry => ({
        date: entry.progress_date,
        overallProgress: entry.overall_progress,
        categories: {
          vocabulary: entry.vocabulary_progress,
          grammar: entry.grammar_progress,
          listening: entry.listening_progress,
          speaking: entry.speaking_progress,
          reading: entry.reading_progress,
          writing: entry.writing_progress
        }
      }));
      
      res.json(formattedHistory);
    } catch (error) {
      console.error('Get progress history error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // --------- Feedback Routes ---------
  
  // Submit feedback for a task
  app.post('/api/feedback', authMiddleware, async (req, res) => {
    try {
      const { taskId, rating, comment, difficulty } = req.body;
      
      // Check if task exists and belongs to user
      const [tasks] = await pool.query(
        'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
        [taskId, req.user.id]
      );
      
      if (tasks.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Check if feedback already exists
      const [existingFeedback] = await pool.query(
        'SELECT * FROM feedback WHERE task_id = ? AND user_id = ?',
        [taskId, req.user.id]
      );
      
      if (existingFeedback.length > 0) {
        // Update existing feedback
        await pool.query(
          'UPDATE feedback SET rating = ?, comment = ?, difficulty = ? WHERE task_id = ? AND user_id = ?',
          [rating, comment, difficulty, taskId, req.user.id]
        );
        
        const [updatedFeedback] = await pool.query(
          'SELECT * FROM feedback WHERE task_id = ? AND user_id = ?',
          [taskId, req.user.id]
        );
        
        return res.json(updatedFeedback[0]);
      }
      
      // Create new feedback
      const [result] = await pool.query(
        'INSERT INTO feedback (user_id, task_id, rating, comment, difficulty) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, taskId, rating, comment, difficulty]
      );
      
      const feedbackId = result.insertId;
      
      // Get created feedback
      const [feedback] = await pool.query(
        'SELECT * FROM feedback WHERE id = ?',
        [feedbackId]
      );
      
      res.status(201).json(feedback[0]);
    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get feedback for a task
  app.get('/api/feedback/:taskId', authMiddleware, async (req, res) => {
    try {
      const [feedback] = await pool.query(
        'SELECT * FROM feedback WHERE task_id = ? AND user_id = ?',
        [req.params.taskId, req.user.id]
      );
      
      if (feedback.length === 0) {
        return res.status(404).json({ message: 'Feedback not found' });
      }
      
      res.json(feedback[0]);
    } catch (error) {
      console.error('Get feedback error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // --------- Notification Routes ---------
  
  // Update FCM token
  app.post('/api/notifications/token', authMiddleware, async (req, res) => {
    try {
      const { fcmToken } = req.body;
      
      await pool.query(
        'UPDATE users SET fcm_token = ? WHERE id = ?',
        [fcmToken, req.user.id]
      );
      
      res.json({ message: 'FCM token updated successfully' });
    } catch (error) {
      console.error('Update FCM token error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Update notification preferences
  app.post('/api/notifications/preferences', authMiddleware, async (req, res) => {
    try {
      const { email, push, sms } = req.body;
      
      await pool.query(
        'UPDATE users SET notification_email = ?, notification_push = ?, notification_sms = ? WHERE id = ?',
        [email, push, sms, req.user.id]
      );
      
      res.json({
        message: 'Notification preferences updated successfully',
        preferences: { email, push, sms }
      });
    } catch (error) {
      console.error('Update notification preferences error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // --------- Analytics Routes ---------
  
  // Get task completion stats
  app.get('/api/analytics/tasks', authMiddleware, async (req, res) => {
    try {
      // Get total tasks
      const [totalResult] = await pool.query(
        'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?',
        [req.user.id]
      );
      
      // Get completed tasks
      const [completedResult] = await pool.query(
        'SELECT COUNT(*) as completed FROM tasks WHERE user_id = ? AND progress = ?',
        [req.user.id, 'Completed']
      );
      
      // Get in progress tasks
      const [inProgressResult] = await pool.query(
        'SELECT COUNT(*) as inProgress FROM tasks WHERE user_id = ? AND progress = ?',
        [req.user.id, 'In Progress']
      );
      
      // Get tasks by category
      const [categoryResult] = await pool.query(
        'SELECT category, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY category',
        [req.user.id]
      );
      
      const categoryStats = {};
      categoryResult.forEach(item => {
        categoryStats[item.category] = item.count;
      });
      
      res.json({
        total: totalResult[0].total,
        completed: completedResult[0].completed,
        inProgress: inProgressResult[0].inProgress,
        notStarted: totalResult[0].total - completedResult[0].completed - inProgressResult[0].inProgress,
        completionRate: totalResult[0].total > 0 ? 
          Math.round((completedResult[0].completed / totalResult[0].total) * 100) : 0,
        byCategory: categoryStats
      });
    } catch (error) {
      console.error('Get task analytics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get learning streak
  app.get('/api/analytics/streak', authMiddleware, async (req, res) => {
    try {
      const today = moment().format('YYYY-MM-DD');
      
      // Get completed tasks for each day, going back 60 days
      const startDate = moment().subtract(60, 'days').format('YYYY-MM-DD');
      
      const [completedTasks] = await pool.query(
        `SELECT DATE(task_date) as date, COUNT(*) as count 
         FROM tasks 
         WHERE user_id = ? AND task_date BETWEEN ? AND ? AND progress = 'Completed'
         GROUP BY DATE(task_date)
         ORDER BY date DESC`,
        [req.user.id, startDate, today]
      );
      
      // Calculate streak
      let streak = 0;
      let currentDate = moment();
      
      while (true) {
        const dateStr = currentDate.format('YYYY-MM-DD');
        const dayCompletedTasks = completedTasks.find(day => day.date === dateStr);
        
        if (dayCompletedTasks && dayCompletedTasks.count > 0) {
          streak++;
          currentDate = currentDate.subtract(1, 'days');
        } else {
          // Check if it's today and no tasks completed yet
          if (dateStr === today && streak === 0) {
            // Check yesterday instead
            currentDate = currentDate.subtract(1, 'days');
            const yesterdayStr = currentDate.format('YYYY-MM-DD');
            const yesterdayTasks = completedTasks.find(day => day.date === yesterdayStr);
            
            if (yesterdayTasks && yesterdayTasks.count > 0) {
              streak = 1;
            }
          }
          break;
        }
      }
      
      res.json({ streak });
    } catch (error) {
      console.error('Get streak error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get recommended learning time
  app.get('/api/analytics/recommended-time', authMiddleware, async (req, res) => {
    try {
      // Get the most common times for completed tasks
      const [completedTaskTimes] = await pool.query(
        `SELECT HOUR(task_time) as hour, COUNT(*) as count 
         FROM tasks 
         WHERE user_id = ? AND progress = 'Completed'
         GROUP BY HOUR(task_time)
         ORDER BY count DESC
         LIMIT 3`,
        [req.user.id]
      );
      
      // Get most productive day of the week
      const [productiveDays] = await pool.query(
        `SELECT DAYOFWEEK(task_date) as day, COUNT(*) as count 
         FROM tasks 
         WHERE user_id = ? AND progress = 'Completed'
         GROUP BY DAYOFWEEK(task_date)
         ORDER BY count DESC
         LIMIT 1`,
        [req.user.id]
      );
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      let recommendedTime = {};
      
      if (completedTaskTimes.length > 0) {
        recommendedTime.preferredHours = completedTaskTimes.map(item => ({
          hour: item.hour,
          count: item.count
        }));
      }
      
      if (productiveDays.length > 0) {
        const day = productiveDays[0].day;
        recommendedTime.mostProductiveDay = {
          day: dayNames[day - 1],
          dayNumber: day,
          count: productiveDays[0].count
        };
      }
      
      res.json(recommendedTime);
    } catch (error) {
      console.error('Get recommended time error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // --------- Scheduler ---------
  
  // Schedule reminder processing every minute
  scheduler.scheduleJob('* * * * *', processReminders);
  
  // --------- Server Initialization ---------
  
  // Initialize database and start server
  async function startServer() {
    try {
      await initializeDatabase();
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Server initialization error:', error);
      process.exit(1);
    }
  }
  
  startServer();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    try {
      console.log('Closing database connections...');
      await pool.end();
      console.log('Database connections closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  module.exports = app;

