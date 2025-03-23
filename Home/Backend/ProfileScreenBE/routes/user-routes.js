import express from "express"
import { UserController } from "../controllers/user-controller.js"
import { authMiddleware } from "../middleware/auth-middleware.js"

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get user profile
router.get("/profile", UserController.getProfile)

// Update user profile
router.put("/profile", UserController.updateProfile)

// Get available vouchers
router.get("/vouchers/available", UserController.getAvailableVouchers)

// Get redeemed vouchers
router.get("/vouchers/redeemed", UserController.getRedeemedVouchers)

// Follow a user
router.post("/follow/:userId", UserController.followUser)

// Unfollow a user
router.delete("/follow/:userId", UserController.unfollowUser)

export default router

