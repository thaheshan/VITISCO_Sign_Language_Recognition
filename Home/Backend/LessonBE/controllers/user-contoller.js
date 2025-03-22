import { userService } from "../services/user-service.js"

const userController = {
  getUserProfile: (req, res) => {
    try {
      const { userId } = req.user
      const user = userService.getUserById(userId)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Remove sensitive information
      const { password, ...userProfile } = user

      res.status(200).json(userProfile)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  updateUserProfile: (req, res) => {
    try {
      const { userId } = req.user
      const updatedData = req.body

      const updatedUser = userService.updateUser(userId, updatedData)

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" })
      }

      // Remove sensitive information
      const { password, ...userProfile } = updatedUser

      res.status(200).json(userProfile)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getUserProgress: (req, res) => {
    try {
      const { userId } = req.user
      const progress = userService.getUserProgress(userId)

      res.status(200).json(progress)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  customizePathway: (req, res) => {
    try {
      const { userId } = req.user
      const { level, topics } = req.body

      const customizedPathway = userService.customizePathway(userId, level, topics)

      res.status(200).json(customizedPathway)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getUserRewards: (req, res) => {
    try {
      const { userId } = req.user
      const rewards = userService.getUserRewards(userId)

      res.status(200).json(rewards)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  claimDailyReward: (req, res) => {
    try {
      const { userId } = req.user
      const reward = userService.claimDailyReward(userId)

      res.status(200).json(reward)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
}

export { userController }

