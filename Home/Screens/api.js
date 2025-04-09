import axios from 'axios';

// Use constant for development or environment variable for production
const API = {
  // URL with fallback for development
  URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.58.40:5000',
  ENDPOINTS: {
    DETECT_GESTURE: '/api/detect-gesture',
    TEXT_TO_SPEECH: '/api/text-to-speech'
  }
};

// Create and configure Axios instance
const apiClient = axios.create({
  baseURL: API.URL,
  timeout: 30000, // 30 seconds timeout for image processing
  headers: {
    'Content-Type': 'application/json', // Default content type
  },
});

// API functions for your sign language application
const SignLanguageAPI = {
  // Test API connection
  testConnection: async () => {
    try {
      console.log('Testing connection to:', API.URL);
      // Simple GET request to test connectivity
      return await apiClient.get('/');
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  },

  // Detect gesture from image
  detectGesture: async (imageBase64) => {
    try {
      // Convert base64 to FormData for file upload
      const formData = new FormData();
      const imageFile = await fetch(imageBase64)
        .then(r => r.blob())
        .then(blob => new File([blob], 'image.jpg', { type: 'image/jpeg' }));
      
      formData.append('image', imageFile);
      
      console.log('Sending detect gesture request to:', API.URL + API.ENDPOINTS.DETECT_GESTURE);
      const response = await apiClient.post(API.ENDPOINTS.DETECT_GESTURE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Override content type for this request
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error detecting gesture:', error.response?.data || error.message);
      throw error;
    }
  },

  // Convert text to speech
  textToSpeech: async (text) => {
    try {
      const response = await apiClient.post(API.ENDPOINTS.TEXT_TO_SPEECH, { text });
      return response.data;
    } catch (error) {
      console.error('Error converting text to speech:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default SignLanguageAPI;