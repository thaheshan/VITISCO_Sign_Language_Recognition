import express from "express"
import { authController } from "../controllers/auth-controller.js"

const router = express.Router()

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/refresh-token", authController.refreshToken)
router.post("/logout", authController.logout)

export { router as authRoutes }

