import express from "express"
import { VoucherController } from "../controllers/voucher-controller.js"
import { authMiddleware } from "../middleware/auth-middleware.js"

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all available vouchers
router.get("/", VoucherController.getAllVouchers)

// Redeem a voucher
router.post("/redeem", VoucherController.redeemVoucher)

// Get user's redeemed vouchers
router.get("/user", VoucherController.getUserVouchers)

export default router

