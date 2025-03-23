import pool from "../config/database.js"

export const BadgeModel = {
  // Get all badges
  getAllBadges: async () => {
    try {
      const [rows] = await pool.query("SELECT * FROM badges")
      return rows
    } catch (error) {
      throw error
    }
  },

  // Get user badges
  getUserBadges: async (userId) => {
    try {
      const [rows] = await pool.query(
        `SELECT b.* 
         FROM badges b
         JOIN user_badges ub ON b.id = ub.badge_id
         WHERE ub.user_id = ?`,
        [userId],
      )
      return rows
    } catch (error) {
      throw error
    }
  },

  // Award badge to user
  awardBadgeToUser: async (userId, badgeId) => {
    try {
      // Check if user already has this badge
      const [existing] = await pool.query("SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?", [
        userId,
        badgeId,
      ])

      if (existing.length > 0) {
        return { success: false, message: "User already has this badge" }
      }

      // Award the badge
      const [result] = await pool.query(
        "INSERT INTO user_badges (user_id, badge_id, awarded_at) VALUES (?, ?, NOW())",
        [userId, badgeId],
      )

      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? "Badge awarded successfully" : "Failed to award badge",
      }
    } catch (error) {
      throw error
    }
  },
}

