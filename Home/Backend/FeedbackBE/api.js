// api.js
import axios from "axios";

// Utility function to get the API URL
const getApiUrl = () => {
  // For Expo Go, use your computer's local network IP
  return "http://192.168.58.40:5000";

  // Alternative approach using Expo's manifest.debuggerHost (if available)
  // This works in some Expo environments but not all
  /*
  const debuggerHost = Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    // Extract the IP address from the debuggerHost 
    const hostIP = debuggerHost.split(':')[0];
    return `http://${hostIP}:5000`;
  }
  return 'http://YOUR_FALLBACK_IP:5000';
  */
};

const API_URL = `${getApiUrl()}/api`;

export const api = {
  // Notifications
  getNotifications: (timeFilter = "all") => {
    return axios.get(`${API_URL}/notifications?timeFilter=${timeFilter}`);
  },
  getNotificationById: (id) => {
    return axios.get(`${API_URL}/notifications/${id}`);
  },
  createNotification: (data) => {
    return axios.post(`${API_URL}/notifications`, data);
  },

  // Feedbacks
  getFeedbacks: () => {
    return axios.get(`${API_URL}/feedbacks`);
  },
  createFeedback: (data) => {
    return axios.post(`${API_URL}/feedbacks`, data);
  },

  // Suggestions
  getSuggestions: () => {
    return axios.get(`${API_URL}/suggestions`);
  },
  createSuggestion: (data) => {
    return axios.post(`${API_URL}/suggestions`, data);
  },
};
