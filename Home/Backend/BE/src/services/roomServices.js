import { Room } from "../models/Room.js"
import { Player } from "../models/Player.js"

export const roomService = {
  async createRoom(roomCode, createdBy) {
    const room = await Room.create(roomCode, createdBy)
    await Player.addToRoom(room.id, createdBy, true)
    return room
  },

  async getRoomByCode(roomCode) {
    return await Room.findByCode(roomCode)
  },

  async getPlayerCount(roomId) {
    return await Player.getCountByRoomId(roomId)
  },

  async addPlayerToRoom(roomId, playerId, isHost) {
    return await Player.addToRoom(roomId, playerId, isHost)
  },

  async getRoomHost(roomId) {
    return await Player.getRoomHost(roomId)
  },

  async updateRoomHost(roomId, playerId) {
    return await Player.updateHost(roomId, playerId)
  },

  async updateRoomStatus(roomId, status) {
    return await Room.updateStatus(roomId, status)
  },

  async findWaitingRoom() {
    return await Room.findWaitingRoom()
  },

  async removePlayerFromRoom(playerId) {
    return await Player.removeByPlayerId(playerId)
  },

  async deleteRoom(roomCode) {
    return await Room.delete(roomCode)
  },
}

