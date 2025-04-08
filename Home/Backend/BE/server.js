const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');

class CameraManager {
  constructor() {
    this.isCameraOpen = false;
    this.currentProcess = null;
  }

  openCamera() {
    return new Promise((resolve, reject) => {
      // Check if camera is already open
      if (this.isCameraOpen) {
        return resolve({
          success: true,
          message: 'Camera already open',
          status: 'active'
        });
      }

      // Platform-specific camera opening commands
      let command;
      switch (os.platform()) {
        case 'darwin':  // macOS
          command = 'open -a /Applications/FaceTime.app';
          break;
        case 'win32':  // Windows
          command = 'start microsoft.windows.camera:';
          break;
        case 'linux':
          // Try multiple common camera apps
          command = 'which cheese && cheese || which guvcview && guvcview || which kamoso && kamoso';
          break;
        default:
          return reject({
            success: false,
            message: 'Unsupported platform',
            platform: os.platform()
          });
      }

      try {
        this.currentProcess = exec(command, (error, stdout, stderr) => {
          if (error) {
            this.isCameraOpen = false;
            return reject({
              success: false,
              message: 'Failed to open camera',
              error: error.message
            });
          }

          this.isCameraOpen = true;
          resolve({
            success: true,
            message: 'Camera opened successfully',
            platform: os.platform(),
            timestamp: new Date().toISOString()
          });
        });
      } catch (catchError) {
        this.isCameraOpen = false;
        reject({
          success: false,
          message: 'Exception in opening camera',
          error: catchError.message
        });
      }
    });
  }

  closeCamera() {
    return new Promise((resolve, reject) => {
      if (!this.isCameraOpen) {
        return resolve({
          success: true,
          message: 'Camera already closed'
        });
      }

      let command;
      switch (os.platform()) {
        case 'darwin':  // macOS
          command = 'killall FaceTime';
          break;
        case 'win32':  // Windows
          command = 'taskkill /F /IM WindowsCamera.exe';
          break;
        case 'linux':
          command = 'pkill -f "cheese\|guvcview\|kamoso"';
          break;
        default:
          return reject({
            success: false,
            message: 'Unsupported platform for camera closing'
          });
      }

      exec(command, (error) => {
        if (error && error.code !== 1) {  // Ignore error code 1 which often means no process found
          return reject({
            success: false,
            message: 'Failed to close camera',
            error: error.message
          });
        }

        this.isCameraOpen = false;
        this.currentProcess = null;
        
        resolve({
          success: true,
          message: 'Camera closed successfully',
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  getCameraStatus() {
    return {
      isOpen: this.isCameraOpen,
      platform: os.platform(),
      timestamp: new Date().toISOString()
    };
  }
}

// Express App Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Camera Manager
const cameraManager = new CameraManager();

// Routes
app.post('/camera/open', async (req, res) => {
  try {
    const result = await cameraManager.openCamera();
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/camera/close', async (req, res) => {
  try {
    const result = await cameraManager.closeCamera();
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get('/camera/status', (req, res) => {
  const status = cameraManager.getCameraStatus();
  res.json(status);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Camera Management Server running on port ${PORT}`);
});

module.exports = app;