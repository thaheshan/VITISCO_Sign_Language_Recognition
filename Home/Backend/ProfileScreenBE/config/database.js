import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "profile_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Function to connect to the database
export const connectToDatabase = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("Connected to MySQL database")
    connection.release()
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
}

// Export the pool to be used in other files
export default pool

