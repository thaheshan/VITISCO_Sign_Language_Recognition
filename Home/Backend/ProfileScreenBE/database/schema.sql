-- Create database
CREATE DATABASE IF NOT EXISTS profile_app;
USE profile_app;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  gender ENUM('Male', 'Female', 'Other'),
  native_language VARCHAR(50),
  location VARCHAR(100),
  membership_id INT DEFAULT 1,
  level INT DEFAULT 1,
  points INT DEFAULT 0,
  xp_points INT DEFAULT 0,
  is_admin BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  points_required INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(10) NOT NULL,
  badge_id INT NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(10) NOT NULL,
  reward_id INT NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

-- Vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  discount_percentage INT NOT NULL,
  points_required INT NOT NULL,
  min_membership_id INT DEFAULT 1,
  is_active BOOLEAN DEFAULT 1,
  expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User vouchers table
CREATE TABLE IF NOT EXISTS user_vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(10) NOT NULL,
  voucher_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  is_used BOOLEAN DEFAULT 0,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE
);

-- Followers table
CREATE TABLE IF NOT EXISTS followers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id VARCHAR(10) NOT NULL,
  followed_id VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_follow (follower_id, followed_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(10) NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default memberships
INSERT INTO memberships (type, description, points_required) VALUES
('Bronze', 'Basic membership level', 0),
('Silver', 'Intermediate membership level', 1000),
('Gold', 'Advanced membership level', 5000),
('Platinum', 'Premium membership level', 10000);

-- Insert sample badges
INSERT INTO badges (name, description, image_url) VALUES
('Badge 1', 'First achievement badge', '/assets/b1.png'),
('Badge 2', 'Second achievement badge', '/assets/b2.png'),
('Badge 3', 'Third achievement badge', '/assets/b3.png'),
('Badge 4', 'Fourth achievement badge', '/assets/b4.png');

-- Insert sample rewards
INSERT INTO rewards (name, description, image_url) VALUES
('Reward 1', 'First reward description', '/assets/r1.png'),
('Reward 2', 'Second reward description', '/assets/r2.png'),
('Reward 3', 'Third reward description', '/assets/r3.png'),
('Reward 4', 'Fourth reward description', '/assets/r4.png');

-- Insert sample vouchers
INSERT INTO vouchers (title, description, discount_percentage, points_required, min_membership_id, expiry_date) VALUES
('10% discount voucher', 'For all members', 10, 1000, 1, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('25% discount voucher', 'For platinum members', 25, 2500, 4, DATE_ADD(NOW(), INTERVAL 30 DAY));

