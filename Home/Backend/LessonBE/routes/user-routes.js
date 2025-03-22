import express from "express"
import { userController } from "../controllers/user-controller.js"
import { authMiddleware } from "../middleware/auth-middleware.js"

const router = express.Router()

// All routes are protected
router.get("/profile", authMiddleware, userController.getUserProfile)
router.put("/profile", authMiddleware, userController.updateUserProfile)
router.get("/progress", authMiddleware, userController.getUserProgress)
router.post("/customize-pathway", authMiddleware, userController.customizePathway)
router.get("/rewards", authMiddleware, userController.getUserRewards)
router.post("/claim-daily-reward", authMiddleware, userController.claimDailyReward)

export { router as userRoutes }

