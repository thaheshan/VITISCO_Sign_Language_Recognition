// File: server/routes/lessonRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get lesson by language and code
router.get('/:language/:lessonCode', async (req, res) => {
  try {
    const { language, lessonCode } = req.params;
    
    const [rows] = await req.db.execute(
      `SELECT * FROM lessons 
       WHERE language = ? AND lesson_code = ?`,
      [language, lessonCode]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Parse JSON content from the database
    const lesson = rows[0];
    if (lesson.content) {
      lesson.content = JSON.parse(lesson.content);
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all lessons for a language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    
    const [rows] = await req.db.execute(
      `SELECT id, lesson_code, title, description, category, lesson_order 
       FROM lessons WHERE language = ? 
       ORDER BY lesson_order`,
      [language]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// File: server/routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get quiz by language and code
router.get('/:language/:quizCode', async (req, res) => {
  try {
    const { language, quizCode } = req.params;
    
    const [quizRows] = await req.db.execute(
      `SELECT * FROM quizzes 
       WHERE language = ? AND quiz_code = ?`,
      [language, quizCode]
    );
    
    if (quizRows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const quiz = quizRows[0];
    
    const [questionRows] = await req.db.execute(
      `SELECT id, question_text, question_type, options 
       FROM questions WHERE quiz_id = ?`,
      [quiz.id]
    );
    
    // Parse JSON options for each question
    const questions = questionRows.map(q => {
      if (q.options) {
        q.options = JSON.parse(q.options);
      }
      return q;
    });
    
    res.json({
      ...quiz,
      questions
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a quiz answer
router.post('/answer', auth, async (req, res) => {
  try {
    const { quizId, questionId, answer } = req.body;
    const userId = req.user.id;
    
    // Get the correct answer
    const [questionRows] = await req.db.execute(
      `SELECT correct_answer FROM questions WHERE id = ?`,
      [questionId]
    );
    
    if (questionRows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const isCorrect = answer === questionRows[0].correct_answer;
    
    // Save the answer
    await req.db.execute(
      `INSERT INTO user_answers (user_id, quiz_id, question_id, user_answer, is_correct)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, quizId, questionId, answer, isCorrect]
    );
    
    res.json({ isCorrect });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz result
router.get('/result/:quizId', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    
    // Get all user answers for this quiz
    const [answerRows] = await req.db.execute(
      `SELECT question_id, user_answer, is_correct 
       FROM user_answers
       WHERE user_id = ? AND quiz_id = ?`,
      [userId, quizId]
    );
    
    // Calculate score
    const totalQuestions = answerRows.length;
    const correctAnswers = answerRows.filter(a => a.is_correct).length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    // Save the quiz result
    await req.db.execute(
      `INSERT INTO quiz_results (user_id, quiz_id, score)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE score = ?, completed_at = CURRENT_TIMESTAMP`,
      [userId, quizId, score, score]
    );
    
    res.json({
      quizId,
      totalQuestions,
      correctAnswers,
      score,
      answers: answerRows
    });
  } catch (error) {
    console.error('Error getting quiz result:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// File: server/routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get user progress
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data
    const [userRows] = await req.db.execute(
      `SELECT id, name, email, preferred_language FROM users WHERE id = ?`,
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userRows[0];
    
    // Get user progress
    const [progressRows] = await req.db.execute(
      `SELECT customization_level, current_level FROM user_progress WHERE user_id = ?`,
      [userId]
    );
    
    const progress = progressRows.length > 0 ? progressRows[0] : { customization_level: 1, current_level: 1 };
    
    // Get completed lessons
    const [lessonRows] = await req.db.execute(
      `SELECT l.lesson_code, l.language, cl.completed_at
       FROM completed_lessons cl
       JOIN lessons l ON cl.lesson_id = l.id
       WHERE cl.user_id = ?`,
      [userId]
    );
    
    // Get quiz results
    const [quizRows] = await req.db.execute(
      `SELECT q.quiz_code, q.language, qr.score, qr.completed_at
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       WHERE qr.user_id = ?`,
      [userId]
    );
    
    // Get user preferences
    const [prefRows] = await req.db.execute(
      `SELECT learning_speed, difficulty FROM user_preferences WHERE user_id = ?`,
      [userId]
    );
    
    const preferences = prefRows.length > 0 ? prefRows[0] : {};
    
    res.json({
      ...user,
      progress,
      completedLessons: lessonRows,
      quizResults: quizRows,
      preferences
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save user progress
router.post('/save', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonCode, language, customizationLevel, currentLevel } = req.body;
    
    // Begin transaction
    await req.db.beginTransaction();
    
    try {
      // Update progress if provided
      if (customizationLevel !== undefined || currentLevel !== undefined) {
        const [progressRows] = await req.db.execute(
          `SELECT id FROM user_progress WHERE user_id = ?`,
          [userId]
        );
        
        if (progressRows.length > 0) {
          // Update existing progress
          let updateQuery = 'UPDATE user_progress SET ';
          const updateParams = [];
          
          if (customizationLevel !== undefined) {
            updateQuery += 'customization_level = ?, ';
            updateParams.push(customizationLevel);
          }
          
          if (currentLevel !== undefined) {
            updateQuery += 'current_level = ?, ';
            updateParams.push(currentLevel);
          }
          
          // Remove trailing comma and space
          updateQuery = updateQuery.slice(0, -2);
          
          updateQuery += ' WHERE user_id = ?';
          updateParams.push(userId);
          
          await req.db.execute(updateQuery, updateParams);
        } else {
          // Create new progress record
          await req.db.execute(
            `INSERT INTO user_progress (user_id, customization_level, current_level)
             VALUES (?, ?, ?)`,
            [userId, customizationLevel || 1, currentLevel || 1]
          );
        }
      }
      
      // Mark lesson as completed if provided
      if (lessonCode && language) {
        // Find lesson id
        const [lessonRows] = await req.db.execute(
          `SELECT id FROM lessons WHERE lesson_code = ? AND language = ?`,
          [lessonCode, language]
        );
        
        if (lessonRows.length > 0) {
          const lessonId = lessonRows[0].id;
          
          // Mark as completed
          await req.db.execute(
            `INSERT INTO completed_lessons (user_id, lesson_id)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP`,
            [userId, lessonId]
          );
        }
      }
      
      // Commit transaction
      await req.db.commit();
      
      res.json({ message: 'Progress saved successfully' });
    } catch (error) {
      await req.db.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;