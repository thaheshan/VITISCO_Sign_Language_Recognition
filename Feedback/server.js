const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/learningapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Define Schemas
const lessonSchema = new mongoose.Schema({
  title: String,
  completion: Number,
  date: String,
  nextDate: String,
  category: String,
  timeSpent: String,
  completedTasks: String,
  totalTasks: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const notificationSchema = new mongoose.Schema({
  userId: String,
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
  },
  message: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const feedbackSchema = new mongoose.Schema({
  userId: String,
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
  },
  message: String,
  rating: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const suggestionSchema = new mongoose.Schema({
  userId: String,
  title: String,
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Models
const Lesson = mongoose.model("Lesson", lessonSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);
const Suggestion = mongoose.model("Suggestion", suggestionSchema);

// API Routes

// Lessons
app.get("/api/lessons", async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/lessons", async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/lessons/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const { userId, timeFilter } = req.query;
    let query = {};

    if (userId) query.userId = userId;

    // Add time-based filtering
    if (timeFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: today };
    } else if (timeFilter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      query.createdAt = { $gte: yesterday, $lt: today };
    }

    const notifications = await Notification.find(query)
      .populate("lessonId")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Feedbacks
app.get("/api/feedbacks", async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};

    if (userId) query.userId = userId;

    const feedbacks = await Feedback.find(query)
      .populate("lessonId")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/feedbacks", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Suggestions
app.get("/api/suggestions", async (req, res) => {
  try {
    const { userId, isActive } = req.query;
    let query = {};

    if (userId) query.userId = userId;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const suggestions = await Suggestion.find(query).sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/suggestions", async (req, res) => {
  try {
    const suggestion = new Suggestion(req.body);
    await suggestion.save();
    res.status(201).json(suggestion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User data route (simplified for this example)
app.get("/api/user/:userId/stats", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Simulating user statistics retrieval
    const stats = {
      totalLessons: await Lesson.countDocuments(),
      completedLessons: await Lesson.countDocuments({ completion: 100 }),
      averageCompletion: await Lesson.aggregate([
        { $group: { _id: null, avg: { $avg: "$completion" } } },
      ]),
      unreadNotifications: await Notification.countDocuments({
        userId,
        isRead: false,
      }),
    };

    res.json({
      userId,
      stats: {
        ...stats,
        averageCompletion:
          stats.averageCompletion.length > 0
            ? Math.round(stats.averageCompletion[0].avg)
            : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// Sample data initialization (for development purposes)
const initSampleData = async () => {
  try {
    // Only add sample data if no lessons exist
    const lessonCount = await Lesson.countDocuments();
    if (lessonCount === 0) {
      console.log("Initializing sample data...");

      // Create sample lessons
      const lessonData = [
        {
          title: "JavaScript Basics",
          completion: 75,
          date: "21 March",
          nextDate: "Next week",
          category: "today",
          timeSpent: "45 minutes",
          completedTasks: "8",
          totalTasks: "10",
        },
        {
          title: "React Native Components",
          completion: 80,
          date: "21 March",
          nextDate: "Next week",
          category: "today",
          timeSpent: "50 minutes",
          completedTasks: "7",
          totalTasks: "9",
        },
        {
          title: "API Integration",
          completion: 65,
          date: "20 March",
          nextDate: "Tomorrow",
          category: "yesterday",
          timeSpent: "35 minutes",
          completedTasks: "5",
          totalTasks: "8",
        },
        {
          title: "UI Design Principles",
          completion: 90,
          date: "20 March",
          nextDate: "Next month",
          category: "yesterday",
          timeSpent: "60 minutes",
          completedTasks: "9",
          totalTasks: "10",
        },
      ];

      const lessons = await Lesson.insertMany(lessonData);

      // Create sample notifications
      const notificationData = lessons.map((lesson) => ({
        userId: "user123",
        lessonId: lesson._id,
        message: `You've completed ${lesson.completion}% of "${lesson.title}"`,
        isRead: false,
      }));

      await Notification.insertMany(notificationData);

      // Create sample feedbacks
      const feedbackData = lessons.map((lesson) => ({
        userId: "user123",
        lessonId: lesson._id,
        message: "Great lesson! I learned a lot about the topic.",
        rating: Math.floor(Math.random() * 5) + 1,
      }));

      await Feedback.insertMany(feedbackData);

      console.log("Sample data initialized successfully");
    }
  } catch (err) {
    console.error("Error initializing sample data:", err);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initSampleData();
});

module.exports = app;
