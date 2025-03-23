import pool from "../config/database.js"

export const RewardModel = {
  // Get all rewards
  getAllRewards: async () => {
    try {
      const [rows] = await pool.query("SELECT * FROM rewards")
      return rows
    } catch (error) {
      throw error
    }
  },

  // Get user rewards
  getUserRewards: async (userId) => {
    try {
      const [rows] = await pool.query(
        `SELECT r.* 
         FROM rewards r
         JOIN user_rewards ur ON r.id = ur.reward_id
         WHERE ur.user_id = ?`,
        [userId],
      )
      return rows
    } catch (error) {
      throw error
    }
  },

  // Award reward to user
  awardRewardToUser: async (userId, rewardId) => {
    try {
      // Check if user already has this reward
      const [existing] = await pool.query("SELECT * FROM user_rewards WHERE user_id = ? AND reward_id = ?", [
        userId,
        rewardId,
      ])

      if (existing.length > 0) {
        return { success: false, message: "User already has this reward" }
      }

      // Award the reward
      const [result] = await pool.query(
        "INSERT INTO user_rewards (user_id, reward_id, awarded_at) VALUES (?, ?, NOW())",
        [userId, rewardId],
      )

      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? "Reward awarded successfully" : "Failed to award reward",
      }
    } catch (error) {
      throw error
    }
  },
}

