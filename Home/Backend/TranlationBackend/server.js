const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configure Python service URL - update with your actual Python service IP
// This should match the IP address where your Python Flask service is running
const PYTHON_SERVICE_URL = 'http://192.168.136.40:3000/detect';

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.post('/api/detect-gesture', async (req, res) => {
  try {
    console.log('Received gesture detection request');
    const { image } = req.body;
    
    if (!image) {
      console.log('No image provided in request');
      return res.status(400).json({ error: 'No image provided' });
    }
    
    console.log(`Forwarding request to Python service at: ${PYTHON_SERVICE_URL}`);
    
    // Forward the request to Python service
    const response = await axios.post(PYTHON_SERVICE_URL, { 
      image 
    }, {
      timeout: 30000, // 30-second timeout for image processing
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Received response from Python service');
    return res.json(response.data);
  } catch (error) {
    console.error('Error processing gesture detection:', error.message);
    
    // Provide more detailed error response for debugging
    return res.status(500).json({
      error: 'Failed to process image',
      details: error.message,
      pythonServiceUrl: PYTHON_SERVICE_URL
    });
  }
});

// Text-to-speech endpoint
app.post('/api/text-to-speech', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    console.log(`Received text for speech conversion: "${text}"`);
    
    // For now, just return a dummy response
    // In a real implementation, you would call a TTS service
    return res.json({
      success: true,
      message: 'Text received for speech conversion',
      text,
      audioUrl: null // In production you would generate a real audio URL
    });
  } catch (error) {
    console.error('Error processing text to speech:', error);
    return res.status(500).json({ error: 'Failed to process text to speech' });
  }
});

// Test endpoint to verify Express server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Express server is working',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    pythonServiceUrl: PYTHON_SERVICE_URL,
    timestamp: new Date().toISOString()
  });
});

// Python service availability check
app.get('/api/check-python-service', async (req, res) => {
  try {
    const pythonUrl = PYTHON_SERVICE_URL.replace('/detect', '/test');
    console.log(`Checking Python service availability at: ${pythonUrl}`);
    
    const response = await axios.get(pythonUrl, { timeout: 5000 });
    return res.json({
      pythonServiceStatus: 'available',
      pythonServiceResponse: response.data
    });
  } catch (error) {
    console.error('Python service unavailable:', error.message);
    return res.json({
      pythonServiceStatus: 'unavailable',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Python service URL: ${PYTHON_SERVICE_URL}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});