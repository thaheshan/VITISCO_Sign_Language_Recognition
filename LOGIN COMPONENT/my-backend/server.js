const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password', // Replace with your MySQL password
    database: 'vitisco',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL Connected!');
        connection.release();
    } catch (error) {
        console.error('MySQL connection error:', error);
    }
}

testConnection();

// Create tables if they don't exist
async function setupDatabase() {
    try {
        // Users table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                profileName VARCHAR(100),
                birthDate VARCHAR(30),
                phoneNumber VARCHAR(20),
                gender VARCHAR(20),
                nativeLanguage VARCHAR(50),
                preferredLanguage VARCHAR(50),
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // OTP table with expiration
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                otp VARCHAR(255) NOT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 10 MINUTE),
                INDEX idx_email (email),
                INDEX idx_expires (expires)
            )
        `);

        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Database setup error:', error);
    }
}

setupDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utility: Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-app-password'     // Replace with your app password
    }
});

// Utility: Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        'VITISCO_JWT_SECRET', // Replace with a secure secret key
        { expiresIn: '24h' }
    );
};

// Utility: Generate OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Utility: Send Email with OTP
const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'VITISCO Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #4B3F72; text-align: center;">VITISCO Password Reset</h2>
                    <p>Your one-time password for resetting your VITISCO account is:</p>
                    <h1 style="text-align: center; letter-spacing: 5px; color: #4B3F72;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you did not request this password reset, please ignore this email.</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

// Middleware: Authenticate JWT
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }
    
    try {
        const decoded = jwt.verify(token, 'VITISCO_JWT_SECRET');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Clean expired OTPs (can be called periodically)
async function cleanExpiredOTPs() {
    try {
        await pool.execute('DELETE FROM otps WHERE expires < NOW()');
    } catch (error) {
        console.error('Clean OTPs error:', error);
    }
}

// Routes

// Test API endpoint
app.get('/api/message', (req, res) => {
    res.json({ message: 'Welcome to VITISCO - Connect, Learn, and Grow!' });
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }
        
        // Find user by username
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        const user = users[0];
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Generate token
        const token = generateToken(user);
        
        // Return user data and token
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profileName: user.profileName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User signup
app.post('/api/signup', async (req, res) => {
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
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide required fields' });
        }
        
        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already in use' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const [result] = await pool.execute(
            `INSERT INTO users (username, email, password, profileName, birthDate, 
            phoneNumber, gender, nativeLanguage, preferredLanguage) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username,
                email,
                hashedPassword,
                profileName || null,
                birthDate || null,
                phoneNumber || null,
                gender || null,
                nativeLanguage || null,
                preferredLanguage || null
            ]
        );
        
        // Get the newly created user
        const [newUsers] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [result.insertId]
        );
        
        const newUser = newUsers[0];
        
        // Generate token
        const token = generateToken(newUser);
        
        // Return success message and token
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Request OTP for password reset
app.post('/api/request-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }
        
        // Check if user exists
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Hash OTP for storage
        const hashedOTP = await bcrypt.hash(otp, 10);
        
        // Delete existing OTP if any
        await pool.execute(
            'DELETE FROM otps WHERE email = ?',
            [email]
        );
        
        // Save OTP to database
        await pool.execute(
            'INSERT INTO otps (email, otp) VALUES (?, ?)',
            [email, hashedOTP]
        );
        
        // Send OTP via email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }
        
        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('OTP request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Resend OTP
app.post('/api/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }
        
        // Check if user exists
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate new OTP
        const otp = generateOTP();
        
        // Hash OTP for storage
        const hashedOTP = await bcrypt.hash(otp, 10);
        
        // Delete existing OTP
        await pool.execute(
            'DELETE FROM otps WHERE email = ?',
            [email]
        );
        
        // Save new OTP to database
        await pool.execute(
            'INSERT INTO otps (email, otp) VALUES (?, ?)',
            [email, hashedOTP]
        );
        
        // Send OTP via email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }
        
        res.json({ message: 'New OTP sent to your email' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }
        
        // Clean expired OTPs
        await cleanExpiredOTPs();
        
        // Find OTP record
        const [otpRecords] = await pool.execute(
            'SELECT * FROM otps WHERE email = ?',
            [email]
        );
        
        if (otpRecords.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        
        const otpRecord = otpRecords[0];
        
        // Verify OTP
        const isValidOTP = await bcrypt.compare(otp, otpRecord.otp);
        if (!isValidOTP) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        
        // Generate temporary token for password reset
        const resetToken = jwt.sign(
            { email },
            'VITISCO_RESET_SECRET',
            { expiresIn: '15m' }
        );
        
        res.json({
            message: 'OTP verified successfully',
            resetToken
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and new password' });
        }
        
        // Check if user exists
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update user password
        await pool.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );
        
        // Delete OTP record
        await pool.execute(
            'DELETE FROM otps WHERE email = ?',
            [email]
        );
        
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected route example (requires authentication)
app.get('/api/profile', authenticate, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, profileName, birthDate, phoneNumber, gender, nativeLanguage, preferredLanguage, created FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});