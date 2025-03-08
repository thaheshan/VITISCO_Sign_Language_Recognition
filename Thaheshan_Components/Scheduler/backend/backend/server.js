const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const moment = require('moment');
const bodyParser = require('body-parser');
const { Expo } = require('expo-server-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const expo = new Expo();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher-scheduler', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Define Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  pushToken: { type: String },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    reminderTime: { type: Number, default: 10 } // Minutes before task to send reminder
  },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'done'], default: 'not_started' },
  duration: { type: String },
  dayOfWeek: { type: Number }, // 0-6 (Sunday-Saturday)
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', UserSchema);
const Task = mongoose.model('Task', TaskSchema);

// Email Configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to parse time
const parseTimeString = (timeStr, dateObj) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (modifier === 'PM' && hours < 12) {
    hours = parseInt(hours, 10) + 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  
  const result = new Date(dateObj);
  result.setHours(parseInt(hours, 10));
  result.setMinutes(parseInt(minutes, 10));
  
  return result;
};

// API Routes

// User Routes
app.post('/api/users', async (req, res) => {
  try {
    const { email, name, notificationPreferences, pushToken } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const newUser = new User({
      email,
      name,
      pushToken,
      notificationPreferences
    });
    
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Task Routes
app.post('/api/tasks', async (req, res) => {
  try {
    const { userId, title, description, date, time, status, duration } = req.body;
    
    const taskDate = new Date(date);
    const dayOfWeek = taskDate.getDay();
    
    const newTask = new Task({
      userId,
      title,
      description,
      date: taskDate,
      time,
      status,
      duration,
      dayOfWeek
    });
    
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tasks/user/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId }).sort({ date: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tasks/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/tasks/:taskId', async (req, res) => {
  try {
    const updates = req.body;
    
    // If date is being updated, recalculate dayOfWeek
    if (updates.date) {
      const taskDate = new Date(updates.date);
      updates.dayOfWeek = taskDate.getDay();
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      updates,
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Task Suggestion API
app.get('/api/suggestions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Find tasks that the user frequently creates on this day of the week
    const frequentTasks = await Task.aggregate([
      { 
        $match: { 
          userId: mongoose.Types.ObjectId(userId),
          dayOfWeek: dayOfWeek
        } 
      },
      {
        $group: {
          _id: "$title",
          count: { $sum: 1 },
          description: { $first: "$description" },
          time: { $first: "$time" },
          duration: { $first: "$duration" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json(frequentTasks);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send email reminder
const sendEmailReminder = async (user, task) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Reminder: ${task.title}`,
      html: `
        <h2>Reminder for your upcoming task</h2>
        <p><strong>${task.title}</strong> is scheduled for ${moment(task.date).format('MMMM Do, YYYY')} at ${task.time}.</p>
        <p>Description: ${task.description || 'N/A'}</p>
        <p>This task will begin in ${user.notificationPreferences.reminderTime} minutes.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email reminder sent to ${user.email} for task ${task.title}`);
    
    // Mark task as reminder sent
    await Task.findByIdAndUpdate(task._id, { reminderSent: true });
  } catch (error) {
    console.error('Error sending email reminder:', error);
  }
};

// Send push notification
const sendPushNotification = async (user, task) => {
  if (!Expo.isExpoPushToken(user.pushToken)) {
    console.error(`Invalid Expo push token: ${user.pushToken}`);
    return;
  }
  
  try {
    const messages = [{
      to: user.pushToken,
      sound: 'default',
      title: `Reminder: ${task.title}`,
      body: `Scheduled for today at ${task.time} (in ${user.notificationPreferences.reminderTime} minutes)`,
      data: { taskId: task._id.toString() }
    }];
    
    const chunks = expo.chunkPushNotifications(messages);
    
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    
    console.log(`Push notification sent to ${user.name} for task ${task.title}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Cron job to check for upcoming tasks and send reminders
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const users = await User.find({});
    
    for (const user of users) {
      const reminderTime = user.notificationPreferences.reminderTime || 10;
      
      // Find tasks that are coming up in the next reminderTime minutes
      const tasks = await Task.find({
        userId: user._id,
        status: { $ne: 'done' },
        reminderSent: false,
        date: {
          $gte: moment().startOf('day').toDate(),
          $lte: moment().endOf('day').toDate()
        }
      });
      
      for (const task of tasks) {
        const taskDateTime = parseTimeString(task.time, task.date);
        const reminderDateTime = new Date(taskDateTime.getTime() - (reminderTime * 60 * 1000));
        
        // Check if it's time to send a reminder
        if (now >= reminderDateTime && now <= taskDateTime) {
          // Send email reminder if enabled
          if (user.notificationPreferences.email) {
            await sendEmailReminder(user, task);
          }
          
          // Send push notification if enabled and token exists
          if (user.notificationPreferences.push && user.pushToken) {
            await sendPushNotification(user, task);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in reminder cron job:', error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;