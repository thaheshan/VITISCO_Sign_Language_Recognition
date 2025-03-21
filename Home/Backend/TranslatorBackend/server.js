const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const tf = require('@tensorflow/tfjs-node');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Increase payload size limit for image data
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Model state
let model = null;
let isModelLoading = false;
const labelMap = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'F',
  7: 'G',
  8: 'H',
  9: 'I',
  10: 'J',
  11: 'K',
  12: 'L',
  13: 'M',
  14: 'N',
  15: 'O',
  16: 'P',
  17: 'Q',
  18: 'R',
  19: 'S',
  20: 'T',
  21: 'U',
  22: 'V',
  23: 'W',
  24: 'X',
  25: 'Y',
  26: 'Z',
  27: 'SPACE',
  0: 'UNKNOWN'
};

// Load the model
async function loadModel() {
  if (model !== null || isModelLoading) return;
  
  isModelLoading = true;
  console.log('Loading sign language detection model...');
  
  try {
    // Replace with path to your model or hosted URL
    // For local models:
    // model = await tf.loadGraphModel('file://./model/model.json');
    // For hosted models:
    model = await tf.loadGraphModel('https://your-hosted-model-url/model.json');
    
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
    model = null;
  } finally {
    isModelLoading = false;
  }
}

// Process the image and make predictions
async function detectSign(imageBuffer) {
  try {
    // Load image
    const image = await loadImage(imageBuffer);
    
    // Create canvas and draw image
    const canvas = createCanvas(256, 256); // Resize to model input size
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, 256, 256);
    
    // Get image data as tensor
    const imageData = ctx.getImageData(0, 0, 256, 256);
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor([256, 256])
      .toFloat()
      .expandDims(0);
    
    // Normalize if your model expects it
    const normalized = tensor.div(tf.scalar(255));
    
    // Run inference
    const predictions = await model.predict(normalized);
    
    // Process predictions
    const arrayData = await predictions.array();
    const highestProbIndex = arrayData[0].indexOf(Math.max(...arrayData[0]));
    const sign = labelMap[highestProbIndex];
    const confidence = arrayData[0][highestProbIndex];
    
    // Cleanup tensors
    tensor.dispose();
    normalized.dispose();
    predictions.dispose();
    
    // Return the detected sign and confidence
    return {
      detected_sign: confidence > 0.7 ? sign : null, // Only return sign if confidence is high enough
      confidence: confidence
    };
  } catch (error) {
    console.error('Error during sign detection:', error);
    throw new Error('Failed to process image');
  }
}

// Routes
// Check model status
app.get('/model-status', (req, res) => {
  // Try to load model if not loaded
  if (model === null && !isModelLoading) {
    loadModel();
  }
  
  res.json({ loaded: model !== null });
});

// Detect sign from image
app.post('/detect-sign', async (req, res) => {
  try {
    // Check if model is loaded
    if (model === null) {
      if (!isModelLoading) {
        loadModel();
      }
      return res.status(503).json({ error: 'Model not loaded yet' });
    }
    
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image, 'base64');
    
    // Process the image and detect sign
    const result = await detectSign(imageBuffer);
    
    res.json(result);
  } catch (error) {
    console.error('Error in sign detection endpoint:', error);
    res.status(500).json({ error: 'Server error during detection' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Sign language translator server running on port ${PORT}`);
  // Load model on startup
  loadModel();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});