const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `sign-detection-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// Updated getApiUrl function
const getApiUrl = () => {
  // First try to get the URL from environment variables
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  
  // If running in a specific environment that provides a hostname
  const hostname = process.env.HOSTNAME || process.env.HOST;
  if (hostname) {
    return `http://${hostname}:${process.env.PORT || 5000}`;
  }
  
  // Detect if running in development or production
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    // For local development, can use localhost
    return 'http://192.168.58.40:5000';
  } else {
    // For production, can use the server's public IP or domain
    // This should be configured in the environment variables
    return process.env.PUBLIC_URL || 'https://api.yourdomain.com';
  }
};

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '34.67.39.101',
  user: process.env.DB_USER || 'admin123',
  password: process.env.DB_PASSWORD || 'vitisco123',
  database: process.env.DB_NAME || 'vitisco',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database Initialization Function
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Translations Table with Improved Schema
    await connection.query(`
      CREATE TABLE IF NOT EXISTS translations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        original_text TEXT,
        translated_text TEXT,
        translation_type ENUM('sign_to_text', 'text_to_sign') DEFAULT 'sign_to_text',
        confidence FLOAT,
        image_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Advanced Gesture Detection Endpoint
app.post('/api/detect-gesture', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const imagePath = req.file.path;
    
    // Validate image file
    const stats = fs.statSync(imagePath);
    if (stats.size === 0) {
      fs.unlinkSync(imagePath);
      return res.status(400).json({ error: 'Empty image file' });
    }

    // Spawn Python detection process with timeout
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'sign_detection_model.py'), 
      imagePath
    ]);

    let result = '';
    let error = '';

    const timeoutId = setTimeout(() => {
      pythonProcess.kill();
      fs.unlinkSync(imagePath);
      res.status(500).json({ error: 'Gesture detection timed out' });
    }, 10000); // 10-second timeout

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      clearTimeout(timeoutId);
      
      // Always remove the temporary file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      if (code !== 0) {
        return res.status(500).json({ 
          error: 'Gesture detection failed', 
          details: error 
        });
      }

      try {
        const detectionResult = JSON.parse(result);
        
        // Save translation to database
        const [insertResult] = await pool.execute(
          'INSERT INTO translations (original_text, translated_text, confidence, image_path) VALUES (?, ?, ?, ?)',
          [
            detectionResult.original || 'Unknown', 
            detectionResult.translated || 'Unknown', 
            detectionResult.confidence || 0, 
            imagePath
          ]
        );

        res.json({
          detected: true,
          gestures: [detectionResult],
          translationId: insertResult.insertId
        });
      } catch (parseError) {
        res.status(500).json({ 
          error: 'Failed to parse detection result', 
          details: parseError.message 
        });
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Gesture detection process failed', 
      details: error.message 
    });
  }
});

// Advanced Text to Speech Endpoint
app.post('/api/text-to-speech', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Text cannot be empty' });
  }

  try {
    const audioDir = path.join(__dirname, 'audio');
    
    // Create audio directory if it doesn't exist
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const pythonProcess = spawn('python', [
      path.join(__dirname, 'text_to_speech_model.py'), 
      text,
      audioDir
    ]);

    let audioPath = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      audioPath += data.toString().trim();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({ 
          error: 'Text to speech conversion failed', 
          details: error 
        });
      }

      // Save TTS record in translations table
      try {
        await pool.execute(
          'INSERT INTO translations (original_text, translated_text, translation_type) VALUES (?, ?, ?)',
          [text, 'TTS', 'text_to_sign']
        );
      } catch (dbError) {
        console.error('Failed to log TTS translation:', dbError);
      }

      res.json({
        audioUrl: `/audio/${path.basename(audioPath)}`,
        text: text
      });
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Text to speech conversion error', 
      details: error.message 
    });
  }
});

// Create an endpoint to get the API URL for clients
app.get('/api/url', (req, res) => {
  res.json({
    apiUrl: getApiUrl()
  });
});

// Enhanced Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const connection = await pool.getConnection();
    connection.release();

    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      services: {
        textToSpeech: 'available',
        gestureDetection: 'available'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong',
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeDatabase();
  console.log(`API URL: ${getApiUrl()}`);
});