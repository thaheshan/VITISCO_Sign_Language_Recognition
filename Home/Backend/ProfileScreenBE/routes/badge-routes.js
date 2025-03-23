import express from "express"
import { BadgeController } from "../controllers/badge-controller.js"
import { authMiddleware } from "../middleware/auth-middleware.js"

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all badges
router.get("/", BadgeController.getAllBadges)

// Get user badges
router.get("/user/:userId?", BadgeController.getUserBadges)

// Award badge to user (admin only)
router.post("/award", BadgeController.awardBadge)

export default router

