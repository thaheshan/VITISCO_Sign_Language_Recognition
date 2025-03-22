const express = require("express");
const cors = require("cors");
const lessonRoutes = require("./routes/lesson-routes.js");
const userRoutes = require("./routes/user-routes.js");
const authRoutes = require("./routes/auth-routes.js");

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/lessons", lessonRoutes)
app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

