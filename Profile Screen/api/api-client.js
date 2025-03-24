// This file can be used in your React Native app to connect to the backend

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_IP = "172.20.10.3"; // Your machine's LAN IP
const API_PORT = "5000";

// Create axios instance
const api = axios.create({
  baseURL: `http://${API_IP}:${API_PORT}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data; // Assuming the token is returned in the response
      await AsyncStorage.setItem("token", token); // Save token in AsyncStorage
      return response.data;
    } catch (error) {
      console.error("Login error", error);
      throw error;
    }
  }
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get("/api/users/profile");
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
  },
  followUser: async (userId) => {
    const response = await api.post(`/users/follow/${userId}`);
    return response.data;
  },
  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/follow/${userId}`);
    return response.data;
  },
};

// Badge API
export const badgeAPI = {
  getAllBadges: async () => {
    const response = await api.get("/badges");
    return response.data;
  },
  getUserBadges: async (userId) => {
    const response = await api.get(`/badges/user/${userId || ""}`);
    return response.data;
  },
};

// Reward API
export const rewardAPI = {
  getAllRewards: async () => {
    const response = await api.get("/rewards");
    return response.data;
  },
  getUserRewards: async (userId) => {
    const response = await api.get(`/rewards/user/${userId || ""}`);
    return response.data;
  },
};

// Voucher API
export const voucherAPI = {
  getAvailableVouchers: async () => {
    const response = await api.get("/users/vouchers/available");
    return response.data;
  },
  getRedeemedVouchers: async () => {
    const response = await api.get("/users/vouchers/redeemed");
    return response.data;
  },
  redeemVoucher: async (voucherId) => {
    const response = await api.post("/vouchers/redeem", { voucherId });
    return response.data;
  },
};

export default api;
