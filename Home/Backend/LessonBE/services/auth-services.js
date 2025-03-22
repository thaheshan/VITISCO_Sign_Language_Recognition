import jwt from "jsonwebtoken"
import crypto from "crypto"

// In-memory data store for users
const users = []

// In-memory data store for refresh tokens
const refreshTokens = {}

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"

// Access token expiration (15 minutes)
const ACCESS_TOKEN_EXPIRATION = "15m"

// Refresh token expiration (7 days)
const REFRESH_TOKEN_EXPIRATION = "7d"

const authService = {
  registerUser: (username, email, password) => {
    // Hash password
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add user to store
    users.push(newUser)

    return newUser
  },

  getUserByEmail: (email) => {
    return users.find((user) => user.email === email)
  },

  authenticateUser: (email, password) => {
    // Hash password
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

    // Find user
    const user = users.find((user) => user.email === email && user.password === hashedPassword)

    return user
  },

  generateTokens: (userId) => {
    // Generate access token
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION })

    // Generate refresh token
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION })

    // Store refresh token
    refreshTokens[refreshToken] = {
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }

    return { accessToken, refreshToken }
  },

  refreshAccessToken: (refreshToken) => {
    // Check if refresh token exists
    if (!refreshTokens[refreshToken]) {
      return null
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)

      // Check if token is expired
      if (refreshTokens[refreshToken].expiresAt < new Date()) {
        delete refreshTokens[refreshToken]
        return null
      }

      // Generate new access token
      const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION })

      return { accessToken }
    } catch (error) {
      return null
    }
  },

  invalidateRefreshToken: (refreshToken) => {
    delete refreshTokens[refreshToken]
  },
}

export { authService }

