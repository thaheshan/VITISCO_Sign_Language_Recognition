// profileApi.js
import axios from "axios";

// Utility function to get the API URL
const getApiUrl = () => {
  // For Expo Go, use your computer's local network IP
  return "http://192.168.58.40:5001"; // Note: Using port 5001 for profile server
};

const API_URL = `${getApiUrl()}/api`;

export const profileApi = {
  // User Profile
  getUserProfile: (userId) => {
    return axios.get(`${API_URL}/profile/${userId}`);
  },
  updateUserProfile: (userId, data) => {
    return axios.put(`${API_URL}/profile/${userId}`, data);
  },

  // Badges and Rewards
  getUserBadges: (userId) => {
    return axios.get(`${API_URL}/profile/${userId}/badges`);
  },
  getUserRewards: (userId) => {
    return axios.get(`${API_URL}/profile/${userId}/rewards`);
  },

  // Vouchers
  getVouchers: () => {
    return axios.get(`${API_URL}/vouchers`);
  },
  redeemVoucher: (userId, voucherId) => {
    return axios.post(`${API_URL}/profile/${userId}/redeem-voucher`, {
      voucherId,
    });
  },

  // XP Points
  getUserXP: (userId) => {
    return axios.get(`${API_URL}/profile/${userId}/xp`);
  },

  // Logout
  logout: () => {
    return axios.post(`${API_URL}/logout`, {});
  },
};
