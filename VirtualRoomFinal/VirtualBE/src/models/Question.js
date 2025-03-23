import { pool } from "../config/database.js"

export class Question {
  static async getRandomQuestions(limit) {
    try {
      const [rows] = await pool.execute("SELECT * FROM questions ORDER BY RAND() LIMIT ?", [limit])

      return rows
    } catch (error) {
      throw error
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM questions WHERE id = ?", [id])

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      throw error
    }
  }
}

