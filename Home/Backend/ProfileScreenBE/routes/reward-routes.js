import express from "express"
import { RewardController } from "../controllers/reward-controller.js"
import { authMiddleware } from "../middleware/auth-middleware.js"

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all rewards
router.get("/", RewardController.getAllRewards)

// Get user rewards
router.get("/user/:userId?", RewardController.getUserRewards)

// Award reward to user (admin only)
router.post("/award", RewardController.awardReward)

export default router

