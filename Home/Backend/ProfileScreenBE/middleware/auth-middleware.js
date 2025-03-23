import jwt from "jsonwebtoken"
import { UserModel } from "../models/user-model.js"

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user exists
    const user = await UserModel.getUserById(decoded.id)

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    }

    // Add user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: user.is_admin === 1,
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ success: false, message: "Token is not valid" })
  }
};

export default authorize;

