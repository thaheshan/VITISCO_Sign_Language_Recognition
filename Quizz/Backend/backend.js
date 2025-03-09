// server.js - Simplified backend for Sign Language Quiz App
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/signLanguageQuizApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Quiz Questions Model - stores all the quiz questions
const quizQuestionsSchema = new mongoose.Schema({
  questions: [{
    id: Number,
    title: String,
    image: String, // Store the image path
    options: [{
      id: String,
      text: String,
      image: String
    }],
    correctAnswer: Number, // Index of the correct option
    gridView: Boolean
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Quiz Progress Model - tracks quiz attempts
const quizAttemptSchema = new mongoose.Schema({
  deviceId: { type: String, required: true }, // Use device ID instead of user ID
  answers: [{ 
    questionId: Number,
    selectedAnswer: Number
  }],
  score: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

const QuizQuestions = mongoose.model('QuizQuestions', quizQuestionsSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

// Routes

// Get all quiz questions
app.get('/api/quiz', async (req, res) => {
  try {
    const quiz = await QuizQuestions.findOne();
    // Remove correct answers before sending to client
    const safeQuiz = quiz ? {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => ({
        ...q,
        correctAnswer: undefined // Hide correct answers from client
      }))
    } : null;
    
    res.json(safeQuiz ? safeQuiz.questions : []);
  } catch (err) {
    console.error('Error fetching quiz questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize or update quiz questions
app.post('/api/quiz/initialize', async (req, res) => {
  try {
    // This would typically be an admin-only endpoint
    const questions = req.body.questions;
    
    // Find existing quiz or create new one
    let quiz = await QuizQuestions.findOne();
    
    if (quiz) {
      quiz.questions = questions;
      quiz.updatedAt = Date.now();
    } else {
      quiz = new QuizQuestions({
        questions
      });
    }
    
    await quiz.save();
    res.json({ message: 'Quiz questions initialized successfully' });
  } catch (err) {
    console.error('Error initializing quiz questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a new quiz attempt
app.post('/api/quiz/start', async (req, res) => {
  try {
    const { deviceId } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ message: 'Device ID is required' });
    }
    
    // Create new attempt
    const attempt = new QuizAttempt({
      deviceId,
      answers: [],
      startedAt: Date.now()
    });
    
    await attempt.save();
    res.json({ 
      attemptId: attempt._id,
      message: 'Quiz started successfully' 
    });
  } catch (err) {
    console.error('Error starting quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save answer for a question
app.post('/api/quiz/answer', async (req, res) => {
  try {
    const { attemptId, questionId, selectedAnswer } = req.body;
    
    if (!attemptId || questionId === undefined || selectedAnswer === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Find the attempt
    const attempt = await QuizAttempt.findById(attemptId);
    
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }
    
    // Check if answer already exists for this question
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex !== -1) {
      // Update existing answer
      attempt.answers[existingAnswerIndex].selectedAnswer = selectedAnswer;
    } else {
      // Add new answer
      attempt.answers.push({ questionId, selectedAnswer });
    }
    
    await attempt.save();
    res.json({ message: 'Answer saved successfully' });
  } catch (err) {
    console.error('Error saving answer:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a quiz attempt and calculate score
app.post('/api/quiz/complete', async (req, res) => {
  try {
    const { attemptId } = req.body;
    
    if (!attemptId) {
      return res.status(400).json({ message: 'Attempt ID is required' });
    }
    
    // Find the attempt
    const attempt = await QuizAttempt.findById(attemptId);
    
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }
    
    // Find quiz questions to calculate score
    const quiz = await QuizQuestions.findOne();
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz questions not found' });
    }
    
    // Calculate score
    let correctAnswers = 0;
    
    attempt.answers.forEach(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.selectedAnswer) {
        correctAnswers++;
      }
    });
    
    // Update attempt
    attempt.score = correctAnswers;
    attempt.completed = true;
    attempt.completedAt = Date.now();
    
    await attempt.save();
    
    res.json({
      score: correctAnswers,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((correctAnswers / quiz.questions.length) * 100)
    });
  } catch (err) {
    console.error('Error completing quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz history for a device
app.get('/api/quiz/history/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const attempts = await QuizAttempt.find({ 
      deviceId, 
      completed: true 
    }).sort({ completedAt: -1 });
    
    res.json(attempts.map(attempt => ({
      id: attempt._id,
      score: attempt.score,
      date: attempt.completedAt,
      answers: attempt.answers.length
    })));
  } catch (err) {
    console.error('Error fetching quiz history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz attempt details
app.get('/api/quiz/attempt/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await QuizAttempt.findById(attemptId);
    
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    
    res.json(attempt);
  } catch (err) {
    console.error('Error fetching attempt:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Populate initial quiz questions (for development/testing)
const initializeQuestions = async () => {
  try {
    // Check if questions already exist
    const existingQuiz = await QuizQuestions.findOne();
    
    if (existingQuiz) {
      console.log('Quiz questions already initialized');
      return;
    }
    
    // Sample correct answers for the questions in your frontend
    const sampleQuestions = [
      {
        id: 1,
        title: 'Select the correct sign for A',
        correctAnswer: 0, // Assuming first option is correct
      },
      {
        id: 2,
        title: 'Select the correct sign for B',
        correctAnswer: 1, // Assuming second option is correct
        gridView: true
      },
      // Add more sample questions here
    ];
    
    // Extract questions from your frontend and add correct answers
    console.log('Initializing sample quiz questions');
    const quiz = new QuizQuestions({ questions: sampleQuestions });
    await quiz.save();
  } catch (err) {
    console.error('Error initializing sample questions:', err);
  }
};

// Server initialization
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize sample questions (uncomment for development)
  // initializeQuestions();
});

// Export for testing purposes
module.exports = app;