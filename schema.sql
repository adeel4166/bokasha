-- CREATE DATABASE IF NOT EXISTS reviews_era;
-- USE reviews_era;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'user') DEFAULT 'user',
    article_quota INT DEFAULT 50,
    used_quota INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Tracking IDs (Custom configurations per region)
CREATE TABLE IF NOT EXISTS user_tracking_ids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    region VARCHAR(10) NOT NULL, -- e.g., 'US', 'DE', 'UK', 'FR'
    tracking_id VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Posts Table (Blogs & Generated Reviews)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    image_url VARCHAR(500),
    amazon_asin VARCHAR(50),
    region VARCHAR(10),
    status ENUM('draft', 'published') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert Default Admin (username: admin, password: adminpassword)
-- In production, the password hash must be generated using bcrypt.
-- Hash of 'adminpassword' is: $2b$10$S9o307/lT6.PkW.u0m67UuhgVfO0tZ7Fm11lE0J1rU4x8.9Z7.jFm
INSERT INTO users (username, password_hash, role, article_quota)
VALUES ('admin', '$2b$10$S9o307/lT6.PkW.u0m67UuhgVfO0tZ7Fm11lE0J1rU4x8.9Z7.jFm', 'admin', 999999)
ON DUPLICATE KEY UPDATE username=username;
