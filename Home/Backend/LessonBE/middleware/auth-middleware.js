import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" })
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Add user info to request
    req.user = {
      userId: decoded.userId,
    }

    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" })
    }

    return res.status(401).json({ message: "Invalid token" })
  }
}

export { authMiddleware }

