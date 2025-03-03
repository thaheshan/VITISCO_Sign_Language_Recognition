const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all progress data for a user
  router.get('/user/:userId', async (req, res, next) => {
    try {
      const userId = req.params.userId;
      
      // Get progress by difficulty level
      const [levelProgress] = await pool.query(`
        SELECT 
          dl.name AS level_name, 
          dl.id AS level_id,
          COUNT(l.id) AS total_lessons,
          SUM(CASE WHEN ulp.completed = 1 THEN 1 ELSE 0 END) AS completed_lessons
        FROM difficulty_levels dl
        JOIN lessons l ON dl.id = l.difficulty_level_id
        LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = ?
        GROUP BY dl.id, dl.name
        ORDER BY dl.level_order
      `, [userId]);
      
      // Get weekly progress data
      const [weeklyData] = await pool.query(`
        SELECT 
          DATE_FORMAT(activity_date, '%a') AS day_label,
          SUM(xp_earned) AS xp_earned
        FROM daily_activities
        WHERE user_id = ? 
        AND activity_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY activity_date
        ORDER BY activity_date
      `, [userId]);
      
      // Format weekly data for the chart
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyDataFormatted = {
        labels: days,
        datasets: [{
          data: days.map(day => {
            const dataPoint = weeklyData.find(d => d.day_label === day);
            return dataPoint ? dataPoint.xp_earned : 0;
          })
        }]
      };
      
      // Get user's total XP and league
      const [userStats] = await pool.query(`
        SELECT xp_points, league FROM users WHERE id = ?
      `, [userId]);
      
      const userData = userStats[0] || { xp_points: 0, league: 'Bronze' };
      
      res.json({
        levelProgress,
        weeklyData: weeklyDataFormatted,
        xpPoints: userData.xp_points,
        league: userData.league
      });
    } catch (error) {
      next(error);
    }
  });
  
  // New endpoint: Get quiz performance stats for a user
  router.get('/quiz-stats/:userId', async (req, res, next) => {
    try {
      const userId = req.params.userId;
      
      // Get quiz performance statistics
      const [quizStats] = await pool.query(`
        SELECT 
          AVG(score) AS average_score,
          AVG(time_spent_seconds) / 60 AS average_time_minutes
        FROM user_lesson_progress
        WHERE user_id = ? 
        AND score IS NOT NULL
      `, [userId]);
      
      // Calculate correct answer percentage
      let correctPercentage = 0;
      let avgTimeMinutes = 0;
      
      if (quizStats.length > 0) {
        correctPercentage = Math.round(quizStats[0].average_score || 0);
        avgTimeMinutes = parseFloat((quizStats[0].average_time_minutes || 0).toFixed(1));
      }
      
      res.json({
        correctAnswersPercentage: correctPercentage,
        averageTimePerQuiz: avgTimeMinutes
      });
    } catch (error) {
      next(error);
    }
  });
  
  // New endpoint: Get rewards data for a user
  router.get('/rewards/:userId', async (req, res, next) => {
    try {
      const userId = req.params.userId;
      
      // Get all rewards with user completion status
      const [rewards] = await pool.query(`
        SELECT 
          r.id,
          r.title,
          r.description,
          r.xp_value,
          ur.id AS user_reward_id,
          ur.date_awarded
        FROM rewards r
        LEFT JOIN user_rewards ur ON r.id = ur.reward_id AND ur.user_id = ?
        ORDER BY r.display_order
      `, [userId]);
      
      // Format the rewards data
      const formattedRewards = rewards.map(reward => ({
        id: reward.id,
        title: reward.title,
        description: reward.description,
        xp: reward.xp_value,
        completed: reward.user_reward_id !== null,
        date: reward.date_awarded ? new Date(reward.date_awarded).toLocaleDateString() : null
      }));
      
      res.json({
        rewards: formattedRewards
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Update lesson progress
  router.post('/lesson', async (req, res, next) => {
    try {
      const { userId, lessonId, completed, score, timeSpent } = req.body;
      
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Check if a record already exists
        const [existing] = await connection.query(
          'SELECT id FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?',
          [userId, lessonId]
        );
        
        let progressId;
        let completionDate = null;
        
        if (completed) {
          completionDate = new Date();
        }
        
        if (existing.length > 0) {
          // Update existing record
          await connection.query(
            `UPDATE user_lesson_progress 
             SET completed = ?, completion_date = ?, score = ?, time_spent_seconds = ?
             WHERE user_id = ? AND lesson_id = ?`,
            [completed ? 1 : 0, completionDate, score, timeSpent, userId, lessonId]
          );
          progressId = existing[0].id;
        } else {
          // Insert new record
          const [result] = await connection.query(
            `INSERT INTO user_lesson_progress 
             (user_id, lesson_id, completed, completion_date, score, time_spent_seconds) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, lessonId, completed ? 1 : 0, completionDate, score, timeSpent]
          );
          progressId = result.insertId;
        }
        
        // If lesson was completed, update user's XP
        if (completed) {
          // Get lesson XP reward
          const [lessonData] = await connection.query(
            'SELECT xp_reward FROM lessons WHERE id = ?',
            [lessonId]
          );
          
          const xpReward = lessonData[0]?.xp_reward || 10;
          
          // Update user XP
          await connection.query(
            'UPDATE users SET xp_points = xp_points + ? WHERE id = ?',
            [xpReward, userId]
          );
          
          // Record daily activity
          const today = new Date().toISOString().split('T')[0];
          
          // Check if we already have an entry for today
          const [existingActivity] = await connection.query(
            'SELECT id FROM daily_activities WHERE user_id = ? AND activity_date = ?',
            [userId, today]
          );
          
          if (existingActivity.length > 0) {
            await connection.query(
              `UPDATE daily_activities 
               SET lessons_completed = lessons_completed + 1, xp_earned = xp_earned + ? 
               WHERE id = ?`,
              [xpReward, existingActivity[0].id]
            );
          } else {
            await connection.query(
              `INSERT INTO daily_activities 
               (user_id, activity_date, lessons_completed, xp_earned) 
               VALUES (?, ?, 1, ?)`,
              [userId, today, xpReward]
            );
          }
          
          // Check for reward eligibility
          await checkAndAwardRewards(connection, userId);
        }
        
        await connection.commit();
        
        res.status(200).json({
          id: progressId,
          completed,
          message: 'Progress updated successfully'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      next(error);
    }
  });
  
  // New endpoint: Switch active language for a user
  router.post('/switch-language', async (req, res, next) => {
    try {
      const { userId, languageId } = req.body;
      
      if (!userId || !languageId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Update user's active language
        await connection.query(
          'UPDATE users SET active_language_id = ? WHERE id = ?',
          [languageId, userId]
        );
        
        // Get the language name
        const [languageData] = await connection.query(
          'SELECT name FROM languages WHERE id = ?',
          [languageId]
        );
        
        const languageName = languageData[0]?.name || 'Unknown';
        
        // Log the language switch
        await connection.query(
          `INSERT INTO user_activity_logs 
           (user_id, activity_type, activity_details, activity_date) 
           VALUES (?, 'LANGUAGE_SWITCH', ?, NOW())`,
          [userId, `Switched to ${languageName}`]
        );
        
        await connection.commit();
        
        res.status(200).json({
          success: true,
          language: languageName,
          message: `Successfully switched to ${languageName}`
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      next(error);
    }
  });
  
  // New endpoint: Get available languages
  router.get('/languages', async (req, res, next) => {
    try {
      const [languages] = await pool.query(`
        SELECT id, name, code, is_active 
        FROM languages 
        WHERE is_active = 1
        ORDER BY name
      `);
      
      res.json({
        languages
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Helper function to check and award rewards
  async function checkAndAwardRewards(connection, userId) {
    try {
      // Check if user completed first lesson
      const [firstLessonReward] = await connection.query(`
        SELECT r.id 
        FROM rewards r 
        WHERE r.title = 'First Lesson' 
        AND NOT EXISTS (
          SELECT 1 FROM user_rewards ur WHERE ur.user_id = ? AND ur.reward_id = r.id
        )
        AND EXISTS (
          SELECT 1 FROM user_lesson_progress ulp WHERE ulp.user_id = ? AND ulp.completed = 1
        )
      `, [userId, userId]);
      
      if (firstLessonReward.length > 0) {
        await awardReward(connection, userId, firstLessonReward[0].id);
      }
      
      // Check for 7-day streak
      const [weekStreakReward] = await connection.query(`
        SELECT r.id 
        FROM rewards r 
        WHERE r.title = 'Week Streak' 
        AND NOT EXISTS (
          SELECT 1 FROM user_rewards ur WHERE ur.user_id = ? AND ur.reward_id = r.id
        )
        AND (
          SELECT COUNT(DISTINCT activity_date) 
          FROM daily_activities 
          WHERE user_id = ? 
          AND activity_date > DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        ) >= 7
      `, [userId, userId]);
      
      if (weekStreakReward.length > 0) {
        await awardReward(connection, userId, weekStreakReward[0].id);
      }
      
      // Check for vocabulary master reward
      const [vocabMasterReward] = await connection.query(`
        SELECT r.id 
        FROM rewards r 
        WHERE r.title = 'Vocabulary Master' 
        AND NOT EXISTS (
          SELECT 1 FROM user_rewards ur WHERE ur.user_id = ? AND ur.reward_id = r.id
        )
        AND (
          SELECT COUNT(*) 
          FROM user_word_progress 
          WHERE user_id = ? AND mastered = 1
        ) >= 100
      `, [userId, userId]);
      
      if (vocabMasterReward.length > 0) {
        await awardReward(connection, userId, vocabMasterReward[0].id);
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Helper function to award a reward
  async function awardReward(connection, userId, rewardId) {
    try {
      // Insert the user reward
      await connection.query(
        'INSERT INTO user_rewards (user_id, reward_id, date_awarded) VALUES (?, ?, NOW())',
        [userId, rewardId]
      );
      
      // Get reward XP value
      const [rewardData] = await connection.query(
        'SELECT xp_value FROM rewards WHERE id = ?',
        [rewardId]
      );
      
      const xpValue = rewardData[0]?.xp_value || 0;
      
      // Update user XP
      if (xpValue > 0) {
        await connection.query(
          'UPDATE users SET xp_points = xp_points + ? WHERE id = ?',
          [xpValue, userId]
        );
      }
    } catch (error) {
      throw error;
    }
  }
  
  return router;
};