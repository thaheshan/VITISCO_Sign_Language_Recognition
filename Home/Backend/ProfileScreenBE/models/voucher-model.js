import pool from "../config/database.js"

export const VoucherModel = {
  // Get all available vouchers
  getAllVouchers: async () => {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM vouchers 
         WHERE expiry_date > NOW() 
         AND is_active = 1`,
      )
      return rows
    } catch (error) {
      throw error
    }
  },

  // Get vouchers by membership type
  getVouchersByMembership: async (membershipType) => {
    try {
      const [rows] = await pool.query(
        `SELECT v.* 
         FROM vouchers v
         JOIN memberships m ON v.min_membership_id <= m.id
         WHERE m.type = ?
         AND v.expiry_date > NOW() 
         AND v.is_active = 1`,
        [membershipType],
      )
      return rows
    } catch (error) {
      throw error
    }
  },

  // Redeem voucher
  redeemVoucher: async (userId, voucherId) => {
    try {
      // Start transaction
      await pool.query("START TRANSACTION")

      // Get voucher details
      const [voucherRows] = await pool.query(
        "SELECT * FROM vouchers WHERE id = ? AND is_active = 1 AND expiry_date > NOW()",
        [voucherId],
      )

      if (voucherRows.length === 0) {
        await pool.query("ROLLBACK")
        return { success: false, message: "Voucher not available or expired" }
      }

      const voucher = voucherRows[0]

      // Check if user has enough points
      const [userRows] = await pool.query("SELECT points FROM users WHERE user_id = ?", [userId])

      if (userRows.length === 0) {
        await pool.query("ROLLBACK")
        return { success: false, message: "User not found" }
      }

      const userPoints = userRows[0].points

      if (userPoints < voucher.points_required) {
        await pool.query("ROLLBACK")
        return { success: false, message: "Not enough points to redeem this voucher" }
      }

      // Deduct points from user
      await pool.query("UPDATE users SET points = points - ? WHERE user_id = ?", [voucher.points_required, userId])

      // Add voucher to user's redeemed vouchers
      await pool.query("INSERT INTO user_vouchers (user_id, voucher_id, redeemed_at, code) VALUES (?, ?, NOW(), ?)", [
        userId,
        voucherId,
        generateVoucherCode(),
      ])

      // Commit transaction
      await pool.query("COMMIT")

      return {
        success: true,
        message: "Voucher redeemed successfully",
        pointsDeducted: voucher.points_required,
      }
    } catch (error) {
      await pool.query("ROLLBACK")
      throw error
    }
  },

  // Get user's redeemed vouchers
  getUserVouchers: async (userId) => {
    try {
      const [rows] = await pool.query(
        `SELECT v.*, uv.redeemed_at, uv.code, uv.is_used 
         FROM vouchers v
         JOIN user_vouchers uv ON v.id = uv.voucher_id
         WHERE uv.user_id = ?
         ORDER BY uv.redeemed_at DESC`,
        [userId],
      )
      return rows
    } catch (error) {
      throw error
    }
  },
}

// Helper function to generate a random voucher code
function generateVoucherCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code
}

