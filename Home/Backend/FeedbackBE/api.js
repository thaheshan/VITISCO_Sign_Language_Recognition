// api.js
import axios from "axios";

// API URLs configuration
const CLOUD_API_URL = "https://backend-83-dot-future-champion-452808-r4.uw.r.appspot.com/api";

// Utility function to get the API URL with fallback logic
const getApiUrl = () => {
  // For Expo Go, use your computer's local network IP as a fallback
  const LOCAL_API_URL = "http://192.168.58.40:5000/api";
  
  // Alternative approach using Expo's manifest.debuggerHost (if available)
  // This works in some Expo environments but not all
  /*
  if (Constants.manifest?.debuggerHost) {
    // Extract the IP address from the debuggerHost 
    const hostIP = Constants.manifest.debuggerHost.split(':')[0];
    return `http://${hostIP}:5000/api`;
  }
  */
  
  return { cloud: CLOUD_API_URL, local: LOCAL_API_URL };
};

const { cloud, local } = getApiUrl();

// Function to make API requests with fallback logic
const makeRequest = async (method, endpoint, data = null) => {
  try {
    // Try cloud API first
    return await axios[method](`${cloud}${endpoint}`, data);
  } catch (cloudError) {
    console.log("Cloud API failed, falling back to local API", cloudError);
    // If cloud API fails, try local API
    try {
      return await axios[method](`${local}${endpoint}`, data);
    } catch (localError) {
      console.error("Both cloud and local API requests failed", localError);
      throw localError; // Re-throw the error after both attempts fail
    }
  }
};

export const api = {
  // Notifications
  getNotifications: (timeFilter = "all") => {
    return makeRequest("get", `/notifications?timeFilter=${timeFilter}`);
  },
  getNotificationById: (id) => {
    return makeRequest("get", `/notifications/${id}`);
  },
  createNotification: (data) => {
    return makeRequest("post", "/notifications", data);
  },

  // Feedbacks
  getFeedbacks: () => {
    return makeRequest("get", "/feedbacks");
  },
  createFeedback: (data) => {
    return makeRequest("post", "/feedbacks", data);
  },

  // Suggestions
  getSuggestions: () => {
    return makeRequest("get", "/suggestions");
  },
  createSuggestion: (data) => {
    return makeRequest("post", "/suggestions", data);
  },
};



