import { roomService } from "../services/roomService.js"
import { rooms } from "../config/socket.js"
import { logger } from "../utils/logger.js"

export const roomController = {
  async createRoom(io, socket, { roomCode }) {
    try {
      if (!roomCode) {
        roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      }

      const room = await roomService.createRoom(roomCode, socket.id)

      // Add room to in-memory storage
      rooms.set(roomCode, {
        id: room.id,
        players: [
          {
            id: socket.id,
            name: `Player ${socket.id.substring(0, 4)}`,
            isHost: true,
          },
        ],
        status: "waiting",
        currentQuestion: 0,
        scores: {},
      })

      // Join the socket to the room
      socket.join(roomCode)

      // Notify client
      socket.emit("room-created", {
        roomCode,
        players: rooms.get(roomCode).players,
      })

      // Update all clients in the room
      io.to(roomCode).emit("players-updated", {
        players: rooms.get(roomCode).players,
      })

      logger.info(`Room created: ${roomCode} by ${socket.id}`)
    } catch (error) {
      logger.error("Error creating room:", error)
      socket.emit("error", { message: "Failed to create room" })
    }
  },

  async joinRoom(io, socket, { roomCode }) {
    try {
      if (!roomCode) {
        return socket.emit("error", { message: "Room code is required" })
      }

      const roomData = await roomService.getRoomByCode(roomCode)

      if (!roomData) {
        return socket.emit("error", { message: "Room not found or game already started" })
      }

      // Check if room is full (max 2 players)
      const playerCount = await roomService.getPlayerCount(roomData.id)

      if (playerCount >= 2) {
        return socket.emit("error", { message: "Room is full" })
      }

      // Add player to room in database
      await roomService.addPlayerToRoom(roomData.id, socket.id, false)

      // Add player to in-memory room
      if (!rooms.has(roomCode)) {
        // Initialize room if not in memory
        const host = await roomService.getRoomHost(roomData.id)

        rooms.set(roomCode, {
          id: roomData.id,
          players: [
            {
              id: host.player_id,
              name: `Player ${host.player_id.substring(0, 4)}`,
              isHost: true,
            },
          ],
          status: "waiting",
          currentQuestion: 0,
          scores: {},
        })
      }

      // Add the new player
      rooms.get(roomCode).players.push({
        id: socket.id,
        name: `Player ${socket.id.substring(0, 4)}`,
        isHost: false,
      })

      // Join the socket to the room
      socket.join(roomCode)

      // Notify client
      socket.emit("room-joined", {
        roomCode,
        players: rooms.get(roomCode).players,
      })

      // Update all clients in the room
      io.to(roomCode).emit("players-updated", {
        players: rooms.get(roomCode).players,
      })

      // If we now have 2 players, notify that the game can start
      if (rooms.get(roomCode).players.length === 2) {
        io.to(roomCode).emit("room-ready")
      }

      logger.info(`Player ${socket.id} joined room: ${roomCode}`)
    } catch (error) {
      logger.error("Error joining room:", error)
      socket.emit("error", { message: "Failed to join room" })
    }
  },

  async joinRandomRoom(io, socket) {
    try {
      // Find a waiting room with 1 player
      const waitingRoom = await roomService.findWaitingRoom()

      if (!waitingRoom) {
        // No waiting rooms, create a new one
        this.createRoom(io, socket, {
          roomCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        })
      } else {
        // Join existing room
        this.joinRoom(io, socket, { roomCode: waitingRoom.room_code })
      }
    } catch (error) {
      logger.error("Error joining random room:", error)
      socket.emit("error", { message: "Failed to join random room" })
    }
  },

  async handleDisconnect(io, socket) {
    try {
      // Find rooms where this player is a member
      for (const [roomCode, room] of rooms.entries()) {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id)

        if (playerIndex !== -1) {
          // Remove player from room
          const player = room.players[playerIndex]
          room.players.splice(playerIndex, 1)

          // Remove from database
          await roomService.removePlayerFromRoom(socket.id)

          // If room is empty, remove it
          if (room.players.length === 0) {
            await roomService.deleteRoom(roomCode)
            rooms.delete(roomCode)
          } else {
            // If the host left, assign a new host
            if (player.isHost && room.players.length > 0) {
              room.players[0].isHost = true
              await roomService.updateRoomHost(room.id, room.players[0].id)
            }

            // Notify remaining players
            io.to(roomCode).emit("players-updated", {
              players: room.players,
            })

            // If game was in progress, end it
            if (room.status === "playing") {
              await roomService.updateRoomStatus(room.id, "waiting")
              room.status = "waiting"

              if (room.timer) {
                clearTimeout(room.timer)
              }

              io.to(roomCode).emit("game-ended", {
                reason: "Player disconnected",
              })
            }
          }

          logger.info(`Player ${socket.id} disconnected from room: ${roomCode}`)
        }
      }
    } catch (error) {
      logger.error("Error handling disconnection:", error)
    }
  },
}

