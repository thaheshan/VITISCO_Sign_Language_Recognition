import { pool } from "../config/database.js"

export class Player {
  static async addToRoom(roomId, playerId, isHost) {
    try {
      const [result] = await pool.execute("INSERT INTO room_players (room_id, player_id, is_host) VALUES (?, ?, ?)", [
        roomId,
        playerId,
        isHost,
      ])

      return { id: result.insertId, roomId, playerId, isHost }
    } catch (error) {
      throw error
    }
  }

  static async getCountByRoomId(roomId) {
    try {
      const [rows] = await pool.execute("SELECT COUNT(*) as count FROM room_players WHERE room_id = ?", [roomId])

      return rows[0].count
    } catch (error) {
      throw error
    }
  }

  static async getRoomHost(roomId) {
    try {
      const [rows] = await pool.execute("SELECT * FROM room_players WHERE room_id = ? AND is_host = true", [roomId])

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      throw error
    }
  }

  static async updateHost(roomId, playerId) {
    try {
      await pool.execute("UPDATE room_players SET is_host = true WHERE room_id = ? AND player_id = ?", [
        roomId,
        playerId,
      ])

      return true
    } catch (error) {
      throw error
    }
  }

  static async removeByPlayerId(playerId) {
    try {
      await pool.execute("DELETE FROM room_players WHERE player_id = ?", [playerId])

      return true
    } catch (error) {
      throw error
    }
  }
}

