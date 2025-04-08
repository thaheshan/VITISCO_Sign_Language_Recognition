// health.js - Express route handler for health endpoint

/**
 * Simple health check endpoint that returns server status
 * This should be mounted at /api/health in your Express app
 */
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // Return basic health information
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'API server is running'
  });
});

module.exports = router;