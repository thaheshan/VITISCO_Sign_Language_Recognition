import express from "express"
import { pool } from "../config/database.js"

const router = express.Router()

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

// Get active rooms count
router.get("/rooms/count", async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM rooms WHERE status = "waiting"')

    res.json({ count: rows[0].count })
  } catch (error) {
    console.error("Error getting room count:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get top players
router.get("/leaderboard", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT player_id, SUM(score) as total_score, COUNT(*) as games_played
      FROM game_results
      GROUP BY player_id
      ORDER BY total_score DESC
      LIMIT 10
    `)

    res.json({ leaderboard: rows })
  } catch (error) {
    console.error("Error getting leaderboard:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router

