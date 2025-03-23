import { RewardModel } from "../models/reward-model.js"

export const RewardController = {
  // Get all rewards
  getAllRewards: async (req, res) => {
    try {
      const rewards = await RewardModel.getAllRewards()
      res.json({ success: true, data: rewards })
    } catch (error) {
      console.error("Error getting rewards:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // Get user rewards
  getUserRewards: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.id

      const rewards = await RewardModel.getUserRewards(userId)

      res.json({ success: true, data: rewards })
    } catch (error) {
      console.error("Error getting user rewards:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // Award reward to user (admin only)
  awardReward: async (req, res) => {
    try {
      const { userId, rewardId } = req.body

      // Check if user is admin (implement your admin check logic here)
      if (!req.user.isAdmin) {
        return res.status(403).json({ success: false, message: "Unauthorized" })
      }

      const result = await RewardModel.awardRewardToUser(userId, rewardId)

      if (result.success) {
        res.json({ success: true, message: result.message })
      } else {
        res.status(400).json({ success: false, message: result.message })
      }
    } catch (error) {
      console.error("Error awarding reward:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },
}

