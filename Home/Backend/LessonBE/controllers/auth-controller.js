import { authService } from "../services/auth-service.js"

const authController = {
  register: (req, res) => {
    try {
      const { username, email, password } = req.body

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" })
      }

      const existingUser = authService.getUserByEmail(email)

      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" })
      }

      const newUser = authService.registerUser(username, email, password)

      // Generate tokens
      const { accessToken, refreshToken } = authService.generateTokens(newUser.id)

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
        accessToken,
        refreshToken,
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  login: (req, res) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" })
      }

      const user = authService.authenticateUser(email, password)

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Generate tokens
      const { accessToken, refreshToken } = authService.generateTokens(user.id)

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        accessToken,
        refreshToken,
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  refreshToken: (req, res) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" })
      }

      const tokens = authService.refreshAccessToken(refreshToken)

      if (!tokens) {
        return res.status(401).json({ message: "Invalid or expired refresh token" })
      }

      res.status(200).json(tokens)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  logout: (req, res) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" })
      }

      authService.invalidateRefreshToken(refreshToken)

      res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
}

export { authController }

