import { VoucherModel } from "../models/voucher-model.js"

export const VoucherController = {
  // Get all available vouchers
  getAllVouchers: async (req, res) => {
    try {
      const vouchers = await VoucherModel.getAllVouchers()
      res.json({ success: true, data: vouchers })
    } catch (error) {
      console.error("Error getting vouchers:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // Redeem a voucher
  redeemVoucher: async (req, res) => {
    try {
      const userId = req.user.id
      const { voucherId } = req.body

      const result = await VoucherModel.redeemVoucher(userId, voucherId)

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          pointsDeducted: result.pointsDeducted,
        })
      } else {
        res.status(400).json({ success: false, message: result.message })
      }
    } catch (error) {
      console.error("Error redeeming voucher:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // Get user's redeemed vouchers
  getUserVouchers: async (req, res) => {
    try {
      const userId = req.user.id

      const vouchers = await VoucherModel.getUserVouchers(userId)

      res.json({ success: true, data: vouchers })
    } catch (error) {
      console.error("Error getting user vouchers:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },
}

