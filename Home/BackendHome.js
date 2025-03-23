const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Database connection
const db = knex({
  client: 'mysql2', 
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'student_progress'
  }
});

// Routes
app.get('/api/user-progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user progress data for lessons, quizzes, and virtual rooms
    const progress = await getUserProgress(userId);
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
});

app.get('/api/user-tasks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user daily tasks
    const tasks = await getUserTasks(userId);
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks data' });
  }
});

// Update progress for a lesson
app.post('/api/lessons/:lessonId/progress', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId, completedSections } = req.body;
    
    await updateLessonProgress(userId, lessonId, completedSections);
    
    const updatedProgress = await getLessonProgress(userId, lessonId);
    res.json(updatedProgress);
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ error: 'Failed to update lesson progress' });
  }
});

// Update progress for a quiz
app.post('/api/quizzes/:quizId/progress', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId, completedQuestions, totalQuestions } = req.body;
    
    await updateQuizProgress(userId, quizId, completedQuestions, totalQuestions);
    
    const updatedProgress = await getQuizProgress(userId, quizId);
    res.json(updatedProgress);
  } catch (error) {
    console.error('Error updating quiz progress:', error);
    res.status(500).json({ error: 'Failed to update quiz progress' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Helper functions
async function getUserProgress(userId) {
  // Get the overall progress for lessons, quizzes, and virtual rooms
  const lessonProgressData = await db('user_lesson_progress')
    .select('lessons.id', 'lessons.title', 'lessons.due_date')
    .join('lessons', 'user_lesson_progress.lesson_id', '=', 'lessons.id')
    .where('user_lesson_progress.user_id', userId)
    .whereRaw('user_lesson_progress.completed_at IS NULL')
    .orderBy('lessons.due_date', 'asc');
    
  const quizProgressData = await db('user_quiz_progress')
    .select('quizzes.id', 'quizzes.title', 'quizzes.due_date')
    .join('quizzes', 'user_quiz_progress.quiz_id', '=', 'quizzes.id')
    .where('user_quiz_progress.user_id', userId)
    .whereRaw('user_quiz_progress.completed_at IS NULL')
    .orderBy('quizzes.due_date', 'asc');
    
  const virtualRoomData = await db('virtual_rooms')
    .select('id', 'title', 'due_date')
    .where('status', 'active')
    .orderBy('due_date', 'asc');
  
  // Calculate progress percentages
  const lessons = await Promise.all(lessonProgressData.map(async (lesson) => {
    const progress = await calculateLessonProgress(userId, lesson.id);
    return {
      ...lesson,
      progress
    };
  }));
  
  const quizzes = await Promise.all(quizProgressData.map(async (quiz) => {
    const progress = await calculateQuizProgress(userId, quiz.id);
    return {
      ...quiz,
      progress
    };
  }));
  
  const virtualRooms = await Promise.all(virtualRoomData.map(async (room) => {
    const progress = await calculateVirtualRoomProgress(userId, room.id);
    return {
      ...room,
      progress
    };
  }));
  
  return {
    lessons,
    quizzes,
    virtualRooms
  };
}

async function calculateLessonProgress(userId, lessonId) {
  // Get total sections in the lesson
  const totalSectionsResult = await db('lesson_sections')
    .count('id as total')
    .where('lesson_id', lessonId)
    .first();
  
  const totalSections = totalSectionsResult.total;
  
  // Get completed sections
  const completedSectionsResult = await db('user_section_progress')
    .count('id as completed')
    .where({
      user_id: userId,
      lesson_id: lessonId,
      completed: true
    })
    .first();
  
  const completedSections = completedSectionsResult.completed;
  
  // Calculate percentage
  return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
}

async function calculateQuizProgress(userId, quizId) {
  // Get total questions in the quiz
  const totalQuestionsResult = await db('quiz_questions')
    .count('id as total')
    .where('quiz_id', quizId)
    .first();
  
  const totalQuestions = totalQuestionsResult.total;
  
  // Get completed questions
  const completedQuestionsResult = await db('user_quiz_answers')
    .count('id as completed')
    .where({
      user_id: userId,
      quiz_id: quizId,
    })
    .first();
  
  const completedQuestions = completedQuestionsResult.completed;
  
  // Calculate percentage
  return totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
}

async function calculateVirtualRoomProgress(userId, roomId) {
  // Get total activities in the virtual room
  const totalActivitiesResult = await db('virtual_room_activities')
    .count('id as total')
    .where('room_id', roomId)
    .first();
  
  const totalActivities = totalActivitiesResult.total;
  
  // Get completed activities
  const completedActivitiesResult = await db('user_virtual_room_progress')
    .count('id as completed')
    .where({
      user_id: userId,
      room_id: roomId,
      completed: true
    })
    .first();
  
  const completedActivities = completedActivitiesResult.completed;
  
  // Calculate percentage
  return totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
}

async function getUserTasks(userId) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Get daily tasks
  return db('user_tasks')
    .select('tasks.id', 'tasks.title', 'tasks.description', 'tasks.type', 'user_tasks.completed')
    .join('tasks', 'user_tasks.task_id', '=', 'tasks.id')
    .where({
      'user_tasks.user_id': userId,
      'user_tasks.task_date': currentDate
    })
    .orderBy('tasks.priority', 'asc');
}

async function updateLessonProgress(userId, lessonId, completedSections) {
  // Update progress for specific sections
  const updates = completedSections.map(sectionId => {
    return db('user_section_progress')
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        section_id: sectionId,
        completed: true,
        completed_at: new Date()
      })
      .onConflict(['user_id', 'lesson_id', 'section_id'])
      .merge();
  });
  
  await Promise.all(updates);
  
  // Update the last_activity timestamp
  await db('user_lesson_progress')
    .where({
      user_id: userId,
      lesson_id: lessonId
    })
    .update({
      last_activity: new Date()
    });
    
  // Check if all sections are completed
  const totalSectionsResult = await db('lesson_sections')
    .count('id as total')
    .where('lesson_id', lessonId)
    .first();
    
  const completedSectionsResult = await db('user_section_progress')
    .count('id as completed')
    .where({
      user_id: userId,
      lesson_id: lessonId,
      completed: true
    })
    .first();
    
  // If all sections are completed, mark the entire lesson as completed
  if (totalSectionsResult.total === completedSectionsResult.completed) {
    await db('user_lesson_progress')
      .where({
        user_id: userId,
        lesson_id: lessonId
      })
      .update({
        completed_at: new Date()
      });
  }
}

async function getLessonProgress(userId, lessonId) {
  const progress = await calculateLessonProgress(userId, lessonId);
  
  const lessonData = await db('lessons')
    .select('id', 'title', 'due_date')
    .where('id', lessonId)
    .first();
    
  return {
    ...lessonData,
    progress
  };
}

async function updateQuizProgress(userId, quizId, completedQuestions, totalQuestions) {
  // Update the user's quiz progress
  await db('user_quiz_progress')
    .where({
      user_id: userId,
      quiz_id: quizId
    })
    .update({
      completed_questions: completedQuestions,
      last_activity: new Date()
    });
    
  // If all questions are completed, mark the quiz as completed
  if (completedQuestions === totalQuestions) {
    await db('user_quiz_progress')
      .where({
        user_id: userId,
        quiz_id: quizId
      })
      .update({
        completed_at: new Date()
      });
  }
}

async function getQuizProgress(userId, quizId) {
  const progress = await calculateQuizProgress(userId, quizId);
  
  const quizData = await db('quizzes')
    .select('id', 'title', 'due_date')
    .where('id', quizId)
    .first();
    
  return {
    ...quizData,
    progress
  };
}