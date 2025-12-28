-- Distilled Water Delivery System Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS distilled_water_db;
USE distilled_water_db;

-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    userType ENUM('user', 'admin', 'transporter') NOT NULL DEFAULT 'user',
    vehicleId VARCHAR(100),
    vehicleName VARCHAR(255),
    vehicleSize ENUM('small', 'medium', 'large'),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_userType (userType)
);

-- Orders table
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    deliveryAddress TEXT NOT NULL,
    preferredDeliveryTime ENUM('morning', 'afternoon', 'evening') NOT NULL,
    specialInstructions TEXT,
    totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'assigned', 'in_transit', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    transporterId VARCHAR(255),
    paymentMethod ENUM('cash', 'mpesa'),
    paymentReference VARCHAR(255),
    startTime TIMESTAMP NULL,
    deliveredTime TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transporterId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_userId (userId),
    INDEX idx_transporterId (transporterId),
    INDEX idx_status (status),
    INDEX idx_createdAt (createdAt)
);

-- Containers table
CREATE TABLE containers (
    id VARCHAR(255) PRIMARY KEY,
    weight DECIMAL(5,2) NOT NULL,
    manufactureDate TIMESTAMP NOT NULL,
    expiryDate TIMESTAMP NOT NULL,
    approved BOOLEAN DEFAULT NULL,
    testerId VARCHAR(255),
    testNotes TEXT,
    testedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (testerId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_approved (approved),
    INDEX idx_expiryDate (expiryDate),
    INDEX idx_manufactureDate (manufactureDate)
);

-- Feedback table
CREATE TABLE feedback (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    orderId VARCHAR(255) NOT NULL,
    transporterId VARCHAR(255),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (transporterId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_userId (userId),
    INDEX idx_orderId (orderId),
    INDEX idx_transporterId (transporterId),
    INDEX idx_rating (rating),
    INDEX idx_createdAt (createdAt)
);

-- Container usage tracking (for order details)
CREATE TABLE order_containers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId VARCHAR(255) NOT NULL,
    containerId VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (containerId) REFERENCES containers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_order_container (orderId, containerId),
    INDEX idx_orderId (orderId),
    INDEX idx_containerId (containerId)
);

-- Create views for common queries
CREATE VIEW order_details AS
SELECT 
    o.*,
    u.name as customer_name,
    u.email as customer_email,
    u.phone as customer_phone,
    t.name as transporter_name,
    t.phone as transporter_phone
FROM orders o
LEFT JOIN users u ON o.userId = u.id
LEFT JOIN users t ON o.transporterId = t.id;

CREATE VIEW container_status_summary AS
SELECT 
    COUNT(*) as total_containers,
    SUM(CASE WHEN approved = 1 THEN 1 ELSE 0 END) as approved_containers,
    SUM(CASE WHEN approved = 0 THEN 1 ELSE 0 END) as rejected_containers,
    SUM(CASE WHEN approved IS NULL THEN 1 ELSE 0 END) as pending_containers,
    SUM(CASE WHEN expiryDate < NOW() THEN 1 ELSE 0 END) as expired_containers
FROM containers;