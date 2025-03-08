import express from "express";
import {
  registerUser,
  getUser,
  updateUser,
  deleteUser,
  authenticateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authenticateUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
