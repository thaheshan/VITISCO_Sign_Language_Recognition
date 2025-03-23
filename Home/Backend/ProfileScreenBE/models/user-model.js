import pool from "../config/database.js"

export const UserModel = {
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const [rows] = await pool.query(
        `SELECT u.*, m.type as membershipType 
         FROM users u
         LEFT JOIN memberships m ON u.membership_id = m.id
         WHERE u.user_id = ?`,
        [userId],
      )
      return rows[0]
    } catch (error) {
      throw error
    }
  },

  // Get user stats (followers, following)
  getUserStats: async (userId) => {
    try {
      const [followersResult] = await pool.query("SELECT COUNT(*) as followers FROM followers WHERE followed_id = ?", [
        userId,
      ])

      const [followingResult] = await pool.query("SELECT COUNT(*) as following FROM followers WHERE follower_id = ?", [
        userId,
      ])

      return {
        followers: followersResult[0].followers,
        following: followingResult[0].following,
      }
    } catch (error) {
      throw error
    }
  },

  // Update user profile
  updateUser: async (userId, userData) => {
    try {
      const { name, location, phone, email, gender, nativeLanguage } = userData

      const [result] = await pool.query(
        `UPDATE users 
         SET name = ?, location = ?, phone = ?, email = ?, gender = ?, native_language = ?
         WHERE user_id = ?`,
        [name, location, phone, email, gender, nativeLanguage, userId],
      )

      return result.affectedRows > 0
    } catch (error) {
      throw error
    }
  },

  // Get user XP points
  getUserXP: async (userId) => {
    try {
      const [rows] = await pool.query("SELECT xp_points FROM users WHERE user_id = ?", [userId])
      return rows[0]?.xp_points || 0
    } catch (error) {
      throw error
    }
  },

  // Get user points
  getUserPoints: async (userId) => {
    try {
      const [rows] = await pool.query("SELECT points FROM users WHERE user_id = ?", [userId])
      return rows[0]?.points || 0
    } catch (error) {
      throw error
    }
  },

  // Update user points
  updateUserPoints: async (userId, points) => {
    try {
      const [result] = await pool.query("UPDATE users SET points = points + ? WHERE user_id = ?", [points, userId])
      return result.affectedRows > 0
    } catch (error) {
      throw error
    }
  },

  // Get user notifications count
  getNotificationsCount: async (userId) => {
    try {
      const [rows] = await pool.query("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0", [
        userId,
      ])
      return rows[0].count
    } catch (error) {
      throw error
    }
  },
}

