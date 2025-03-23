import { AuthModel } from "../models/auth-model.js";

export const AuthController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const userData = req.body;

      const result = await AuthModel.register(userData);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          token: result.token,
          user: result.user,
        });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const result = await AuthModel.login(email, password);

      if (result.success) {
        res.json({
          success: true,
          token: result.token,
          user: result.user,
        });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
