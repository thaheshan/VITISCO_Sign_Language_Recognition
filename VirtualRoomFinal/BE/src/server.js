import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import { setupSocketIO } from "./config/socket.js"
import apiRoutes from "./routes/api.js"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
app.use(cors())
app.use(express.json())

// API routes
app.use("/api", apiRoutes)

// Create HTTP server
const server = http.createServer(app)

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Setup Socket.IO
setupSocketIO(io)

// Start the server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

