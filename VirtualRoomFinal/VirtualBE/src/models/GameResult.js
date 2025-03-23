import { pool } from "../config/database.js"

export class GameResult {
  static async create(roomId, playerId, score) {
    try {
      const [result] = await pool.execute("INSERT INTO game_results (room_id, player_id, score) VALUES (?, ?, ?)", [
        roomId,
        playerId,
        score,
      ])

      return { id: result.insertId, roomId, playerId, score }
    } catch (error) {
      throw error
    }
  }

  static async getByRoomId(roomId) {
    try {
      const [rows] = await pool.execute("SELECT * FROM game_results WHERE room_id = ? ORDER BY score DESC", [roomId])

      return rows
    } catch (error) {
      throw error
    }
  }
}

