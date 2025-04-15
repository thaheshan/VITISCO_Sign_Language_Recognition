// server.js - Updated Backend for Vitisco App with improved frontend connectivity

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configuration
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'vitisco_jwt_secret_key';
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds

// Initialize Express app
const app = express();

// Middleware with extended CORS configuration
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Use JSON parser with increased limit for larger payloads
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// For debugging request data
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "34.67.39.101",
  user: process.env.DB_USER || "admin123",
  password: process.env.DB_PASSWORD || "vitisco123",
  database: process.env.DB_NAME || "vitisco",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


// Test database connection on startup
(async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();

// In-memory OTP storage (consider using Redis in production)
const otpStore = new Map();

// Email transporter setup for sending OTPs
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Test route - expanded for better connectivity testing
app.get('/api/message', (req, res) => {
  console.log('GET /api/message endpoint hit');
  res.json({ 
    message: 'Welcome to Vitisco API! Backend is working correctly.',
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// Add simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User Login endpoint with enhanced error handling
app.post('/api/login', async (req, res) => {
  console.log('Login attempt received:', req.body);
  try {
    const { username, password } = req.body;
    
    // Validate request
    if (!username || !password) {
      console.log('Login validation failed: missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Get user from database
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    connection.release();
    
    if (users.length === 0) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = users[0];
    console.log(`User found: ${user.username}`);
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Create and assign token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Login successful for user:', user.username);
    
    // Return user data and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profileName: user.profile_name
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login', details: error.message });
  }
});

// User Signup endpoint with improved error handling
app.post('/api/signup', async (req, res) => {
  console.log('Signup request received');
  try {
    const { 
      username, 
      email, 
      password, 
      profileName, 
      birthDate, 
      phoneNumber, 
      gender,
      nativeLanguage,
      preferredLanguage
    } = req.body;
    
    // Validate request
    if (!username || !email || !password) {
      console.log('Signup validation failed');
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    
    console.log(`Attempting to create user: ${username}, ${email}`);
    
    const connection = await pool.getConnection();
    
    // Check if username or email already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      connection.release();
      console.log('Username or email already exists');
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Parse date if needed
    let formattedDate = birthDate;
    if (birthDate && birthDate.includes('/')) {
      const [day, month, year] = birthDate.split('/');
      formattedDate = `${year}-${month}-${day}`;
    }
    
    console.log('Inserting new user into database');
    
    // Insert user into database
    const [result] = await connection.execute(
      `INSERT INTO users (
        username, email, password, profile_name, birth_date, 
        phone_number, gender, native_language, preferred_language, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        username, email, hashedPassword, profileName, formattedDate,
        phoneNumber, gender, nativeLanguage, preferredLanguage
      ]
    );
    
    connection.release();
    
    // Create and send token
    const token = jwt.sign(
      { id: result.insertId, username, email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log(`User registered successfully: ${username}`);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        username,
        email,
        profileName
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during registration', details: error.message });
  }
});

// Request OTP for password reset
app.post('/api/request-otp', async (req, res) => {
  console.log('OTP request received');
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if user exists
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    connection.release();
    
    if (users.length === 0) {
      console.log(`User with email ${email} not found`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`Generated OTP for ${email}: ${otp}`);
    
    // Store OTP with expiry time
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY
    });
    
    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER || 'vitisco@example.com',
      to: email,
      subject: 'Password Reset OTP - Vitisco',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #4B3F72; text-align: center;">Vitisco Password Reset</h2>
            <p>You have requested to reset your password. Please use the following OTP code to verify your identity:</p>
            <div style="text-align: center; padding: 20px;">
              <h1 style="letter-spacing: 5px; font-size: 36px; color: #4B3F72;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this password reset, please ignore this email or contact support.</p>
          </div>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // For development, still succeed even if email fails
      console.log('Development mode: proceeding despite email failure');
    }
    
    res.status(200).json({ 
      message: 'OTP sent successfully',
      // Include the OTP in response for development/testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
    
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Server error while sending OTP', details: error.message });
  }
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
  console.log('OTP verification attempt');
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    console.log(`Verifying OTP for ${email}: ${otp}`);
    
    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);
    
    if (!otpData) {
      console.log('No OTP found for this email');
      return res.status(400).json({ error: 'No OTP request found for this email' });
    }
    
    if (Date.now() > otpData.expiresAt) {
      console.log('OTP expired');
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    if (otpData.otp !== otp) {
      console.log('Invalid OTP');
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    console.log('OTP verified successfully');
    
    // Mark OTP as verified
    otpStore.set(email, { ...otpData, verified: true });
    
    // Generate a temporary token for password reset
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
    
    res.status(200).json({
      message: 'OTP verified successfully',
      resetToken
    });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Server error while verifying OTP', details: error.message });
  }
});

// Resend OTP
app.post('/api/resend-otp', async (req, res) => {
  console.log('Resend OTP request');
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`New OTP for ${email}: ${otp}`);
    
    // Store OTP with expiry time
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY
    });
    
    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER || 'vitisco@example.com',
      to: email,
      subject: 'Password Reset OTP - Vitisco',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #4B3F72; text-align: center;">Vitisco Password Reset</h2>
            <p>You have requested to resend your OTP. Please use the following OTP code to verify your identity:</p>
            <div style="text-align: center; padding: 20px;">
              <h1 style="letter-spacing: 5px; font-size: 36px; color: #4B3F72;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this password reset, please ignore this email or contact support.</p>
          </div>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Resent OTP email to ${email}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // For development, still succeed even if email fails
      console.log('Development mode: proceeding despite email failure');
    }
    
    res.status(200).json({ 
      message: 'New OTP sent successfully',
      // Include the OTP in response for development/testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Server error while resending OTP', details: error.message });
  }
});

// Reset password
app.post('/api/reset-password', async (req, res) => {
  console.log('Password reset request');
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    console.log(`Attempting password reset for ${email}`);
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update password in database
    const connection = await pool.getConnection();
    
    // First check if user exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      connection.release();
      console.log('User not found for password reset');
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update the password
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    connection.release();
    
    console.log(`Password reset successful for ${email}`);
    
    // Clear OTP data
    otpStore.delete(email);
    
    res.status(200).json({ message: 'Password reset successful' });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Server error during password reset', details: error.message });
  }
});

// Get user profile (protected route example)
app.get('/api/profile', authenticateToken, async (req, res) => {
  console.log(`Profile request for user ID: ${req.user.id}`);
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, username, email, profile_name, birth_date, phone_number, gender, native_language, preferred_language, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    connection.release();
    
    if (users.length === 0) {
      console.log('User profile not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    console.log(`Profile fetched for ${user.username}`);
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      profileName: user.profile_name,
      birthDate: user.birth_date,
      phoneNumber: user.phone_number,
      gender: user.gender,
      nativeLanguage: user.native_language,
      preferredLanguage: user.preferred_language,
      createdAt: user.created_at
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile', details: error.message });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Vitisco API server running on port ${PORT}`);
  console.log(`Server time: ${new Date().toISOString()}`);
});

// Create database tables if they don't exist
(async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profile_name VARCHAR(100),
        birth_date DATE,
        phone_number VARCHAR(20),
        gender ENUM('male', 'female', 'other'),
        native_language VARCHAR(50),
        preferred_language VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Count users to check if we need to add sample data
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    // Add sample user for testing if no users exist
    if (userCount[0].count === 0 && process.env.NODE_ENV === 'development') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await connection.execute(`
        INSERT INTO users (username, email, password, profile_name, gender)
        VALUES ('testuser', 'test@example.com', ?, 'Test User', 'male')
      `, [hashedPassword]);
      
      console.log('Added sample user for testing:');
      console.log('Username: testuser');
      console.log('Password: password123');
    }
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
})();

module.exports = app; 