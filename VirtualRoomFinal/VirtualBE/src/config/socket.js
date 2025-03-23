import { roomController } from "../controllers/roomController.js"
import { gameController } from "../controllers/gameController.js"
import { logger } from "../utils/logger.js"

// Store active rooms and their players
export const rooms = new Map()

export const setupSocketIO = (io) => {
  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`)

    // Room events
    socket.on("create-room", (data) => roomController.createRoom(io, socket, data))
    socket.on("join-room", (data) => roomController.joinRoom(io, socket, data))
    socket.on("join-random", () => roomController.joinRandomRoom(io, socket))

    // Game events
    socket.on("start-game", (data) => gameController.startGame(io, socket, data))
    socket.on("submit-answer", (data) => gameController.submitAnswer(io, socket, data))

    // Chat events
    socket.on("send-message", (data) => {
      const { roomCode, message } = data

      if (!roomCode || !message) {
        return socket.emit("error", { message: "Invalid message data" })
      }

      const room = rooms.get(roomCode)

      if (!room) {
        return socket.emit("error", { message: "Room not found" })
      }

      const player = room.players.find((p) => p.id === socket.id)

      if (!player) {
        return socket.emit("error", { message: "Player not found in room" })
      }

      // Broadcast message to all players in the room
      io.to(roomCode).emit("new-message", {
        id: Date.now(),
        sender: player.name,
        text: message,
      })
    })

    // Disconnect event
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`)
      roomController.handleDisconnect(io, socket)
    })
  })
}

