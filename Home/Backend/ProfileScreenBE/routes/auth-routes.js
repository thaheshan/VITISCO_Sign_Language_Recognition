import express from "express"
import { AuthController } from "../controllers/auth-controller.js"

const router = express.Router()

// Register a new user
router.post("/register", AuthController.register)

// Login user
router.post("/login", AuthController.login)

export default router

