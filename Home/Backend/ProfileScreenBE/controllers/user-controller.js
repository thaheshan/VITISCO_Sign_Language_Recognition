import { UserModel } from "../models/user-model.js"
import { BadgeModel } from "../models/badge-model.js"
import { RewardModel } from "../models/reward-model.js"
import { VoucherModel } from "../models/voucher-model.js"
import pool from "../config/database.js" // Import the database connection pool

export const UserController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id

      // Get user data
      const user = await UserModel.getUserById(userId)

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" })
      }

      // Get user stats
      const stats = await UserModel.getUserStats(userId)

      // Get user badges
      const badges = await BadgeModel.getUserBadges(userId)

      // Get user rewards
      const rewards = await RewardModel.getUserRewards(userId)

      // Get notifications count
      const notificationsCount = await UserModel.getNotificationsCount(userId)

      // Format response
      const response = {
        userId: user.user_id,
        name: user.name,
        handle: `@${user.name.toLowerCase().replace(/\s+/g, "")}${Math.floor(Math.random() * 1000)}`,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        nativeLanguage: user.native_language,
        location: user.location,
        level: user.level,
        membershipType: user.membershipType,
        points: user.points,
        xpPoints: user.xp_points,
        followers: stats.followers,
        following: stats.following,
        notifications: notificationsCount,
        badges,
        rewards,
      }

      res.json({ success: true, data: response })
    } catch (error) {
      console.error("Error getting user profile:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id
      const userData = req.body

      const success = await UserModel.updateUser(userId, userData)

      if (success) {
        res.json({ success: true, message: "Profile updated successfully" })
      } else {
        res.status(400).json({ success: false, message: "Failed to update profile" })
      }
    } catch (error) {
      console.error("Error updating user profile:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // Get available vouchers for user
  getAvailableVouchers: async (req, res) => {
    try {
      const userId = req.user.id

      // Get user's membership type
      const user = await UserModel.getUserById(userId)

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" })
      }

      // Get vouchers available for user's membership
      const vouchers = await VoucherModel.getVouchersByMembership(user.membershipType)

      res.json({ success: true, data: vouchers })
    } catch (error) {
      console.error("Error getting available vouchers:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // Get user's redeemed vouchers
  getRedeemedVouchers: async (req, res) => {
    try {
      const userId = req.user.id

      const vouchers = await VoucherModel.getUserVouchers(userId)

      res.json({ success: true, data: vouchers })
    } catch (error) {
      console.error("Error getting redeemed vouchers:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // Follow a user
  followUser: async (req, res) => {
    try {
      const followerId = req.user.id
      const { userId: followedId } = req.params

      // Check if users exist
      const follower = await UserModel.getUserById(followerId)
      const followed = await UserModel.getUserById(followedId)

      if (!follower || !followed) {
        return res.status(404).json({ success: false, message: "User not found" })
      }

      // Check if already following
      const [existing] = await pool.query("SELECT * FROM followers WHERE follower_id = ? AND followed_id = ?", [
        followerId,
        followedId,
      ])

      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: "Already following this user" })
      }

      // Add follow relationship
      const [result] = await pool.query(
        "INSERT INTO followers (follower_id, followed_id, created_at) VALUES (?, ?, NOW())",
        [followerId, followedId],
      )

      if (result && result.affectedRows > 0) {
        res.json({ success: true, message: "User followed successfully" })
      } else {
        res.status(400).json({ success: false, message: "Failed to follow user" })
      }
    } catch (error) {
      console.error("Error following user:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // Unfollow a user
  unfollowUser: async (req, res) => {
    try {
      const followerId = req.user.id
      const { userId: followedId } = req.params

      // Delete follow relationship
      const [result] = await pool.query("DELETE FROM followers WHERE follower_id = ? AND followed_id = ?", [
        followerId,
        followedId,
      ])

      if (result && result.affectedRows > 0) {
        res.json({ success: true, message: "User unfollowed successfully" })
      } else {
        res.status(400).json({ success: false, message: "Not following this user" })
      }
    } catch (error) {
      console.error("Error unfollowing user:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },
}

