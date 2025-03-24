import { pool } from "../config/database.js"

export class Room {
  static async create(roomCode, createdBy) {
    try {
      const [result] = await pool.execute("INSERT INTO rooms (room_code, created_by, status) VALUES (?, ?, ?)", [
        roomCode,
        createdBy,
        "waiting",
      ])

      return { id: result.insertId, roomCode, createdBy, status: "waiting" }
    } catch (error) {
      throw error
    }
  }

  static async findByCode(roomCode) {
    try {
      const [rows] = await pool.execute("SELECT * FROM rooms WHERE room_code = ?", [roomCode])

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      throw error
    }
  }

  static async findWaitingRoom() {
    try {
      const [rows] = await pool.execute(`
        SELECT r.id, r.room_code, COUNT(rp.id) as player_count 
        FROM rooms r
        JOIN room_players rp ON r.id = rp.room_id
        WHERE r.status = 'waiting'
        GROUP BY r.id
        HAVING player_count = 1
        LIMIT 1
      `)

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      throw error
    }
  }

  static async updateStatus(id, status) {
    try {
      await pool.execute("UPDATE rooms SET status = ? WHERE id = ?", [status, id])

      return true
    } catch (error) {
      throw error
    }
  }

  static async delete(roomCode) {
    try {
      await pool.execute("DELETE FROM rooms WHERE room_code = ?", [roomCode])

      return true
    } catch (error) {
      throw error
    }
  }
}

