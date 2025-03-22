// server.js
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(helmet()); // Set various HTTP headers for security
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Restrict to your frontend domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request logging
app.use(morgan('combined'));

// Parse JSON bodies
app.use(express.json({ limit: '1mb' })); // Limit payload size

// Get API URL
const getApiUrl = () => {
  // For Expo Go, use your computer's local network IP
  return process.env.API_URL || 'http://192.168.1.25:5000';
};

const API_BASE_URL = getApiUrl();
console.log("Using API URL:", API_BASE_URL);

// Create database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vitisco',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add these for better debug information and handling
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  debug: process.env.NODE_ENV === 'development'
});

// Test database connection
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Error sqlState:', error.sqlState);
    
    // Provide helpful error messages based on common error codes
    if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to MySQL server. Make sure it is running.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check your username and password.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database "vitisco" does not exist. Create it first in phpMyAdmin.');
    }
    
    return false;
  }
};

// Immediately execute connection test 
(async () => {
  const connected = await testDbConnection();
  if (!connected) {
    console.error('Warning: Starting server without database connection.');
    // You could choose to exit here with:
    // process.exit(1);
  }
})();

// Setup email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Store OTP codes (in memory - would use Redis in production)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Basic route for testing
app.get('/api/message', (req, res) => {
  res.json({ message: 'Welcome to Vitisco API!' });
});

// Database connection test route
app.get('/api/db-test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ message: 'Database connection successful!' });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message,
      code: error.code
    });
  }
});

// User registration endpoint with validation
app.post('/api/signup', [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('profileName').trim().notEmpty().withMessage('Profile name is required'),
  body('birthDate').isDate().withMessage('Enter a valid birth date'),
  body('phoneNumber').isMobilePhone().withMessage('Enter a valid phone number'),
  body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('nativeLanguage').trim().notEmpty().withMessage('Native language is required'),
  body('preferredLanguage').trim().notEmpty().withMessage('Preferred language is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { username, email, password, profileName, birthDate, phoneNumber, gender, nativeLanguage, preferredLanguage } = req.body;
  
  try {
    // Check if user already exists - QUERY 1
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: 'User already exists with this username or email'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user - QUERY 2
    const [result] = await pool.query(
      `INSERT INTO users 
      (username, email, password, profile_name, birth_date, phone_number, gender, native_language, preferred_language) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, profileName, birthDate, phoneNumber, gender, nativeLanguage, preferredLanguage]
    );
    
    // Create user profile record - QUERY 3
    await pool.query(
      `INSERT INTO user_profiles 
      (user_id, avatar_url, bio, created_at) 
      VALUES (?, ?, ?, NOW())`,
      [result.insertId, null, null]
    );
    
    // Generate token for auto-login
    const user = { id: result.insertId, username, email };
    const token = generateToken(user);
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { username, password } = req.body;
  
  try {
    // Find user - QUERY 4
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = users[0];
    
    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Log login attempt - QUERY 5
    await pool.query(
      'INSERT INTO login_logs (user_id, success, ip_address, timestamp) VALUES (?, ?, ?, NOW())',
      [user.id, 1, req.ip]
    );
    
    // Generate token
    const token = generateToken(user);
    
    // Fetch user profile data - QUERY 6
    const [profiles] = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [user.id]
    );
    
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      profileName: user.profile_name,
      profile: profiles.length > 0 ? profiles[0] : null
    };
    
    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Request password reset (send OTP)
app.post('/api/request-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email } = req.body;
  
  try {
    // Check if user exists - QUERY 7
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If your email is registered, you will receive a reset code' });
    }
    
    const user = users[0];
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiry (10 minutes)
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000
    });
    
    // Send email with OTP
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@vitisco.com',
      to: email,
      subject: 'Password Reset Code for Vitisco',
      text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
      html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'If your email is registered, you will receive a reset code' });
    
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Server error while processing your request' });
  }
});

// Verify OTP
app.post('/api/verify-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, otp } = req.body;
  
  try {
    // Check if OTP exists and is valid
    const storedOtpData = otpStore.get(email);
    
    if (!storedOtpData || storedOtpData.otp !== otp || Date.now() > storedOtpData.expires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store reset token in database - QUERY 8
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?',
      [resetToken, email]
    );
    
    // Remove OTP from store
    otpStore.delete(email);
    
    res.json({
      message: 'OTP verified successfully',
      resetToken
    });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Server error while verifying OTP' });
  }
});

// Reset password
app.post('/api/reset-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  
  try {
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update password in database - QUERY 9
    const [result] = await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ?',
      [hashedPassword, email]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Password reset successful' });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Server error while resetting password' });
  }
});

// Resend OTP
app.post('/api/resend-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email } = req.body;
  
  try {
    // Check if user exists - QUERY 10
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If your email is registered, you will receive a new reset code' });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    
    // Store OTP with expiry (10 minutes)
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000
    });
    
    // Send email with OTP
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@vitisco.com',
      to: email,
      subject: 'New Password Reset Code for Vitisco',
      text: `Your new verification code is: ${otp}. This code will expire in 10 minutes.`,
      html: `<p>Your new verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'If your email is registered, you will receive a new reset code' });
    
  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({ error: 'Server error while processing your request' });
  }
});

// Protected route - Get user profile
app.get('/api/user-profile', authenticateToken, async (req, res) => {
  try {
    // Fetch user profile data - QUERY 11
    const [profiles] = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Fetch user data - QUERY 12
    const [users] = await pool.query(
      'SELECT id, username, email, profile_name, birth_date, phone_number, gender, native_language, preferred_language FROM users WHERE id = ?',
      [req.user.id]
    );
    
    const userData = {
      ...users[0],
      profile: profiles[0]
    };
    
    res.json({
      user: userData
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// Update user profile
app.put('/api/user-profile', authenticateToken, [
  body('profileName').trim().optional(),
  body('bio').trim().optional(),
  body('avatarUrl').optional().isURL().withMessage('Avatar URL must be valid')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { profileName, bio, avatarUrl } = req.body;
  
  try {
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update user data if profileName provided - QUERY 13
      if (profileName) {
        await connection.query(
          'UPDATE users SET profile_name = ? WHERE id = ?',
          [profileName, req.user.id]
        );
      }
      
      // Update profile data - QUERY 14
      if (bio !== undefined || avatarUrl !== undefined) {
        const updateFields = [];
        const updateValues = [];
        
        if (bio !== undefined) {
          updateFields.push('bio = ?');
          updateValues.push(bio);
        }
        
        if (avatarUrl !== undefined) {
          updateFields.push('avatar_url = ?');
          updateValues.push(avatarUrl);
        }
        
        updateFields.push('updated_at = NOW()');
        updateValues.push(req.user.id);
        
        await connection.query(
          `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`,
          [...updateValues]
        );
      }
      
      await connection.commit();
      
      res.json({ message: 'Profile updated successfully' });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// Change password
app.post('/api/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { currentPassword, newPassword } = req.body;
  
  try {
    // Get user with password - QUERY 15
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Validate current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password - QUERY 16
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Server error while changing password' });
  }
});

// Logout (client-side implementation, just for completeness)
app.post('/api/logout', authenticateToken, (req, res) => {
  // JWT tokens are stateless, so we don't need to do anything server-side
  // The client should discard the token
  res.json({ message: 'Logged out successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 middleware for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Start the server - Make sure to listen on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app for testing purposes
module.exports = app;

