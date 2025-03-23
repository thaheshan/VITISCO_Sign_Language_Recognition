import pool from "../config/database.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const AuthModel = {
  // Register a new user
  register: async (userData) => {
    try {
      const { name, email, password, phone, gender, nativeLanguage, location } = userData

      // Check if email already exists
      const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

      if (existingUser.length > 0) {
        return { success: false, message: "Email already in use" }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Generate user ID
      const userId = generateUserId()

      // Insert new user
      const [result] = await pool.query(
        `INSERT INTO users 
         (user_id, name, email, password, phone, gender, native_language, location, membership_id, level, points, xp_points, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0, 0, NOW())`,
        [userId, name, email, hashedPassword, phone, gender, nativeLanguage, location],
      )

      if (result.affectedRows > 0) {
        // Generate JWT token
        const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: "30d" })

        return {
          success: true,
          message: "User registered successfully",
          token,
          user: {
            userId,
            name,
            email,
            phone,
            gender,
            nativeLanguage,
            location,
            membershipType: "Bronze", // Default membership
            level: 1,
            points: 0,
            xpPoints: 0,
          },
        }
      } else {
        return { success: false, message: "Failed to register user" }
      }
    } catch (error) {
      throw error
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      // Find user by email
      const [users] = await pool.query(
        `SELECT u.*, m.type as membershipType 
         FROM users u
         LEFT JOIN memberships m ON u.membership_id = m.id
         WHERE u.email = ?`,
        [email],
      )

      if (users.length === 0) {
        return { success: false, message: "Invalid email or password" }
      }

      const user = users[0]

      // Check password
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return { success: false, message: "Invalid email or password" }
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" })

      // Get user stats
      const [followersResult] = await pool.query("SELECT COUNT(*) as followers FROM followers WHERE followed_id = ?", [
        user.user_id,
      ])

      const [followingResult] = await pool.query("SELECT COUNT(*) as following FROM followers WHERE follower_id = ?", [
        user.user_id,
      ])

      // Get notifications count
      const [notificationsResult] = await pool.query(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
        [user.user_id],
      )

      return {
        success: true,
        token,
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          nativeLanguage: user.native_language,
          location: user.location,
          membershipType: user.membershipType,
          level: user.level,
          points: user.points,
          xpPoints: user.xp_points,
          followers: followersResult[0].followers,
          following: followingResult[0].following,
          notifications: notificationsResult[0].count,
        },
      }
    } catch (error) {
      throw error
    }
  },
}

// Helper function to generate a user ID
function generateUserId() {
  const prefix = "ZA"
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${randomNum}`
}

