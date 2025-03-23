import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import userRoutes from "./routes/user-routes.js"
import badgeRoutes from "./routes/badge-routes.js"
import rewardRoutes from "./routes/reward-routes.js"
import voucherRoutes from "./routes/voucher-routes.js"
import authRoutes from "./routes/auth-routes.js"
import { connectToDatabase } from "./config/database.js"
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const cors = require("cors");
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MySQL database
connectToDatabase()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/badges", badgeRoutes)
app.use("/api/rewards", rewardRoutes)
app.use("/api/vouchers", voucherRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

