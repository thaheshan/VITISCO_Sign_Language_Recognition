import { BadgeModel } from "../models/badge-model.js";

export const BadgeController = {
  // Get all badges
  getAllBadges: async (req, res) => {
    try {
      const badges = await BadgeModel.getAllBadges();
      res.json({ success: true, data: badges });
    } catch (error) {
      console.error("Error getting badges:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Get user badges
  getUserBadges: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.id;

      const badges = await BadgeModel.getUserBadges(userId);

      res.json({ success: true, data: badges });
    } catch (error) {
      console.error("Error getting user badges:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Award badge to user (admin only)
  awardBadge: async (req, res) => {
    try {
      const { userId, badgeId } = req.body;

      // Check if user is admin (implement your admin check logic here)
      if (!req.user.isAdmin) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await BadgeModel.awardBadgeToUser(userId, badgeId);

      if (result.success) {
        res.json({ success: true, message: result.message });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
