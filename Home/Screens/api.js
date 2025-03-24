// import axios from 'axios';

// // API configuration
// const API = {
//   URL: 'http://192.168.136.40:3000',
//   ENDPOINTS: {
//     HEALTH: '/api/health',
//     DETECT_GESTURE: '/api/detect-gesture',
//     TEXT_TO_SPEECH: '/api/text-to-speech'
//   }
// };

// // Create and configure Axios instance
// const apiClient = axios.create({
//   baseURL: API.URL,
//   timeout: 30000, // 30 seconds timeout for image processing
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // API functions for your sign language application
// const SignLanguageAPI = {
//   // Test API connection
//   testConnection: async () => {
//     // try {
//       return await apiClient.get(API.ENDPOINTS.HEALTH);
//     } catch (error) {
//       console.error('Error testing connection:', error);
//       throw error;
//     }
//   },
  
//   // Detect gesture from image
//   detectGesture: async (imageBase64) => {
//     try {
//       console.log('Sending detect gesture request to:', API.URL + API.ENDPOINTS.DETECT_GESTURE);
//       const response = await apiClient.post(API.ENDPOINTS.DETECT_GESTURE, {
//         image: imageBase64
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error detecting gesture:', error.response?.data || error.message);
//       throw error;
//     }
//   },
  
//   // Convert text to speech
//   textToSpeech: async (text) => {
//     try {
//       const response = await apiClient.post(API.ENDPOINTS.TEXT_TO_SPEECH, {
//         text
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error converting text to speech:', error.response?.data || error.message);
//       throw error;
//     }
//   }
// };

// export default SignLanguageAPI;

