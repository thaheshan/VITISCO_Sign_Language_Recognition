// server.js - Complete Language Learning App Backend
const express = require('express');
const mongoose = require('mongoose');
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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/language-learning-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

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
// DATABASE MODELS
// ======================

// User Model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  targetLanguage: {
    type: String,
    required: true
  },
  proficiencyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  fcmToken: {
    type: String
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// Task Model
const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'writing', 'custom'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  reminderMinutes: {
    type: Number,
    default: 15
  },
  progress: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', taskSchema);

// Progress Model
const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  vocabularyProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  grammarProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  listeningProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  speakingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  readingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  writingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

const Progress = mongoose.model('Progress', progressSchema);

// Feedback Model
const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['Too Easy', 'Just Right', 'Too Difficult'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Reminder Model
const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  },
  methods: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  }
});

const Reminder = mongoose.model('Reminder', reminderSchema);

// ======================
// MIDDLEWARE
// ======================

// Authentication middleware
const authMiddleware = (req, res, next) => {
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
function calculateCategoryProgress(tasks, category) {
  const categoryTasks = tasks.filter(task => task.category === category);
  
  if (categoryTasks.length === 0) return 0;
  
  const completedTasks = categoryTasks.filter(task => task.progress === 'Completed');
  return Math.round((completedTasks.length / categoryTasks.length) * 100);
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
      <p><strong>Time:</strong> ${task.time}</p>
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
  if (!user.fcmToken || !admin) return;
  
  const message = {
    notification: {
      title: 'Language Learning Reminder',
      body: `Time for: ${task.title}`
    },
    data: {
      taskId: task._id.toString(),
      category: task.category,
      click_action: 'OPEN_TASK_DETAILS'
    },
    token: user.fcmToken
  };
  
  try {
    await admin.messaging().send(message);
    console.log(`Push notification sent to user ${user._id} for task ${task.title}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// Update user progress based on completed task
async function updateProgressForCompletedTask(userId, task) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if progress record exists for today
    let progress = await Progress.findOne({
      userId,
      date: { 
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // If no record exists, create one with baseline values
    if (!progress) {
      // Get the most recent progress record to use as baseline
      const lastProgress = await Progress.findOne({ userId }).sort({ date: -1 });
      
      let baseProgress = {
        vocabularyProgress: 0,
        grammarProgress: 0,
        listeningProgress: 0,
        speakingProgress: 0,
        readingProgress: 0,
        writingProgress: 0,
        overallProgress: 0
      };
      
      // Use last progress values if available
      if (lastProgress) {
        baseProgress = {
          vocabularyProgress: lastProgress.vocabularyProgress,
          grammarProgress: lastProgress.grammarProgress,
          listeningProgress: lastProgress.listeningProgress,
          speakingProgress: lastProgress.speakingProgress,
          readingProgress: lastProgress.readingProgress,
          writingProgress: lastProgress.writingProgress,
          overallProgress: lastProgress.overallProgress
        };
      }
      
      progress = new Progress({
        userId,
        date: today,
        ...baseProgress
      });
    }
    
    // Increment progress in the relevant category (between 2-5 points)
    const incrementValue = Math.floor(Math.random() * 4) + 2;
    
    // Update the specific category based on task
    switch (task.category) {
      case 'vocabulary':
        progress.vocabularyProgress = Math.min(100, progress.vocabularyProgress + incrementValue);
        break;
      case 'grammar':
        progress.grammarProgress = Math.min(100, progress.grammarProgress + incrementValue);
        break;
      case 'listening':
        progress.listeningProgress = Math.min(100, progress.listeningProgress + incrementValue);
        break;
      case 'speaking':
        progress.speakingProgress = Math.min(100, progress.speakingProgress + incrementValue);
        break;
      case 'reading':
        progress.readingProgress = Math.min(100, progress.readingProgress + incrementValue);
        break;
      case 'writing':
        progress.writingProgress = Math.min(100, progress.writingProgress + incrementValue);
        break;
      default:
        // For custom tasks, increment a random category
        const categories = ['vocabularyProgress', 'grammarProgress', 'listeningProgress', 
                            'speakingProgress', 'readingProgress', 'writingProgress'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        progress[randomCategory] = Math.min(100, progress[randomCategory] + incrementValue);
    }
    
    // Recalculate overall progress (average of all categories)
    progress.overallProgress = Math.round(
      (progress.vocabularyProgress + 
       progress.grammarProgress + 
       progress.listeningProgress + 
       progress.speakingProgress + 
       progress.readingProgress + 
       progress.writingProgress) / 6
    );
    
    await progress.save();
    return progress;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
}

// Create reminder for task
async function createReminderForTask(task) {
  try {
    // Get task time components
    const [hours, minutes] = task.time.split(':').map(Number);
    
    // Create reminder date
    const reminderDate = new Date(task.date);
    reminderDate.setHours(hours, minutes - task.reminderMinutes, 0, 0);
    
    // Don't create reminder if the time has already passed
    if (reminderDate < new Date()) {
      console.log('Reminder time has already passed, not creating reminder');
      return null;
    }
    
    // Get user notification preferences
    const user = await User.findById(task.userId);
    
    // Create the reminder
    const reminder = new Reminder({
      userId: task.userId,
      taskId: task._id,
      scheduledTime: reminderDate,
      methods: {
        email: user.notificationPreferences.email,
        push: user.notificationPreferences.push,
        sms: user.notificationPreferences.sms
      }
    });
    
    await reminder.save();
    console.log(`Reminder created for task ${task.title} at ${reminderDate}`);
    return reminder;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
}

// Update reminder for task
async function updateReminderForTask(task) {
  try {
    // Delete existing reminders for this task
    await Reminder.deleteMany({ taskId: task._id });
    
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
    const dueReminders = await Reminder.find({
      scheduledTime: { $lte: fiveMinutesFromNow, $gte: now },
      sent: false
    });
    
    console.log(`Processing ${dueReminders.length} pending reminders`);
    
    for (const reminder of dueReminders) {
      // Get task and user info
      const task = await Task.findById(reminder.taskId);
      const user = await User.findById(reminder.userId);
      
      if (!task || !user) {
        console.log(`Task or user not found for reminder ${reminder._id}`);
        reminder.sent = true;
        await reminder.save();
        continue;
      }
      
      // Send reminders based on user preferences
      if (reminder.methods.email && user.notificationPreferences.email) {
        await sendEmailReminder(user, task);
      }
      
      if (reminder.methods.push && user.notificationPreferences.push) {
        await sendPushNotification(user, task);
      }
      
      // Mark reminder as sent
      reminder.sent = true;
      await reminder.save();
      
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
  try {
    const { username, email, password, targetLanguage, proficiencyLevel } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      username,
      email,
      password,
      targetLanguage,
      proficiencyLevel
    });
    
    await user.save();
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'languagelearningsecret', {
      expiresIn: '7d'
    });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        targetLanguage: user.targetLanguage,
        proficiencyLevel: user.proficiencyLevel
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'languagelearningsecret', {
      expiresIn: '7d'
    });
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        targetLanguage: user.targetLanguage,
        proficiencyLevel: user.proficiencyLevel
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
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { username, targetLanguage, proficiencyLevel, notificationPreferences, fcmToken } = req.body;
    
    const updateFields = {};
    if (username) updateFields.username = username;
    if (targetLanguage) updateFields.targetLanguage = targetLanguage;
    if (proficiencyLevel) updateFields.proficiencyLevel = proficiencyLevel;
    if (notificationPreferences) updateFields.notificationPreferences = notificationPreferences;
    if (fcmToken) updateFields.fcmToken = fcmToken;
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
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
    const task = new Task({
      userId: req.user.id,
      title,
      description,
      category,
      date: new Date(date),
      time,
      reminderMinutes,
      progress: 'Not Started'
    });
    
    await task.save();
    
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
    const tasks = await Task.find({ userId: req.user.id }).sort({ date: 1, time: 1 });
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
    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateStr);
    endDate.setHours(23, 59, 59, 999);
    
    const tasks = await Task.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ time: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by date error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific task by ID
app.get('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, date, time, reminderMinutes } = req.body;
    
    // Find and update task
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, description, category, date: new Date(date), time, reminderMinutes },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
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
    
    // Find and update task progress
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { progress },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
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
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Delete associated reminder
    await Reminder.deleteMany({ taskId: task._id });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get suggested tasks based on user's language and proficiency
app.get('/api/tasks/suggested/all', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In a real app, you would fetch these from a database based on user's language and level
    // For now, we'll return a static list similar to what's in the frontend
    const suggestedTasks = [
      { label: 'Vocabulary Practice: Food', value: 'vocab_food', category: 'vocabulary', icon: 'fast-food-outline' },
      { label: 'Grammar: Past Tense', value: 'grammar_past', category: 'grammar', icon: 'book-outline' },
      { label: 'Listening Exercise: Conversations', value: 'listening', category: 'listening', icon: 'headset-outline' },
      { label: 'Speaking Practice: Introductions', value: 'speaking', category: 'speaking', icon: 'mic-outline' },
      { label: 'Reading: Short Stories', value: 'reading', category: 'reading', icon: 'newspaper-outline' },
      { label: 'Writing: Daily Journal', value: 'writing', category: 'writing', icon: 'create-outline' },
    ];
    
    // Add some language-specific tasks
    if (user.targetLanguage) {
      const languageSpecificTasks = [
        { 
          label: `${user.targetLanguage} Vocabulary: Common Phrases`, 
          value: `vocab_${user.targetLanguage.toLowerCase()}`, 
          category: 'vocabulary', 
          icon: 'chatbubbles-outline' 
        },
        { 
          label: `${user.targetLanguage} Listening: Native Speakers`, 
          value: `listening_${user.targetLanguage.toLowerCase()}`, 
          category: 'listening', 
          icon: 'headset-outline' 
        }
      ];
      
      suggestedTasks.push(...languageSpecificTasks);
    }
    
    // Add level-specific tasks
    if (user.proficiencyLevel) {
      let levelSpecificTask;
      switch (user.proficiencyLevel) {
        case 'beginner':
          levelSpecificTask = { 
            label: 'Basic Greetings and Introductions', 
            value: 'beginner_basics', 
            category: 'speaking', 
            icon: 'people-outline' 
          };
          break;
        case 'intermediate':
          levelSpecificTask = { 
            label: 'Intermediate Conversation Practice', 
            value: 'intermediate_convo', 
            category: 'speaking', 
            icon: 'people-outline' 
          };
          break;
        case 'advanced':
          levelSpecificTask = { 
            label: 'Advanced Discussion Topics', 
            value: 'advanced_discussion', 
            category: 'speaking', 
            icon: 'people-outline' 
          };
          break;
      }
      
      if (levelSpecificTask) {
        suggestedTasks.push(levelSpecificTask);
      }
    }
    
    res.json(suggestedTasks);
  } catch (error) {
    console.error('Get suggested tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --------- Progress Routes ---------

// Get overall progress for user
app.get('/api/progress', authMiddleware, async (req, res) => {
  try {
    // Get most recent progress entry
    const latestProgress = await Progress.findOne({ userId: req.user.id })
      .sort({ date: -1 });
    
    if (!latestProgress) {
      return res.json({
        vocabularyProgress: 0,
        grammarProgress: 0,
        listeningProgress: 0,
        speakingProgress: 0,
        readingProgress: 0,
        writingProgress: 0,
        overallProgress: 0
      });
    }
    
    res.json({
      vocabularyProgress: latestProgress.vocabularyProgress,
      grammarProgress: latestProgress.grammarProgress,
      listeningProgress: latestProgress.listeningProgress,
      speakingProgress: latestProgress.speakingProgress,
      readingProgress: latestProgress.readingProgress,
      writingProgress: latestProgress.writingProgress,
      overallProgress: latestProgress.overallProgress
    });
  } catch (error) {
    console.error('Get overall progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress history for a date range
app.get('/api/progress/history', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { userId: req.user.id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const progressHistory = await Progress.find(query).sort({ date: 1 });
    
    res.json(progressHistory);
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
    
    // Verify task exists and belongs to user
    const task = await Task.findOne({ _id: taskId, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const feedback = new Feedback({
      userId: req.user.id,
      taskId,
      rating,
      comment,
      difficulty
    });
    
    await feedback.save();
    
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all feedback for a user
app.get('/api/feedback', authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.id })
      .populate('taskId')
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --------- Notification Routes ---------

// Update notification preferences
app.put('/api/notifications/preferences', authMiddleware, async (req, res) => {
  try {
    const { email, push, sms } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        notificationPreferences: { email, push, sms } 
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.notificationPreferences);
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register FCM token for push notifications
app.post('/api/notifications/token', authMiddleware, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fcmToken },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================
// SCHEDULED JOBS
// ======================

// Schedule reminder check every minute
scheduler.scheduleJob('*/1 * * * *', async () => {
  await processReminders();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

