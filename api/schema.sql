-- Parkganern schema + seed data.
-- Re-importing this file wipes all parking data and resets the demo accounts.
-- Uses its own database so the existing `parkganern` database is never touched.
-- Run: C:\xampp\mysql\bin\mysql.exe -u root < api\schema.sql

CREATE DATABASE IF NOT EXISTS parkganern_parking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parkganern_parking;

DROP TABLE IF EXISTS parking_history;
DROP TABLE IF EXISTS parking_records;
DROP TABLE IF EXISTS registered_motorists;
DROP TABLE IF EXISTS parking_spaces;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(190) NOT NULL DEFAULT '',
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(100) NOT NULL DEFAULT 'Parking manager',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE parking_spaces (
  id VARCHAR(8) PRIMARY KEY,
  zone CHAR(1) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'motorcycle',
  status ENUM('available', 'occupied', 'reserved') NOT NULL DEFAULT 'available',
  rate DECIMAL(8, 2) NOT NULL DEFAULT 0,
  INDEX idx_status (status)
) ENGINE = InnoDB;

CREATE TABLE parking_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plate VARCHAR(20) NOT NULL,
  model VARCHAR(100) NOT NULL,
  slot VARCHAR(8) NOT NULL,
  driver VARCHAR(150) NOT NULL,
  contact VARCHAR(60) NOT NULL DEFAULT 'Not provided',
  classification ENUM('Student', 'School Staff', 'Visitor') NOT NULL,
  student_id VARCHAR(40) DEFAULT NULL,
  entered_at DATETIME NOT NULL,
  exited_at DATETIME DEFAULT NULL,
  INDEX idx_slot (slot),
  INDEX idx_entered (entered_at),
  CONSTRAINT fk_record_slot FOREIGN KEY (slot) REFERENCES parking_spaces (id)
) ENGINE = InnoDB;

CREATE TABLE registered_motorists (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plate VARCHAR(20) NOT NULL UNIQUE,
  model VARCHAR(100) NOT NULL,
  owner VARCHAR(150) NOT NULL,
  contact VARCHAR(60) NOT NULL DEFAULT 'Not provided',
  classification ENUM('Student', 'School Staff', 'Visitor') NOT NULL,
  student_id VARCHAR(40) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE parking_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id INT UNSIGNED NOT NULL,
  event VARCHAR(60) NOT NULL,
  occurred_at DATETIME NOT NULL,
  CONSTRAINT fk_history_record FOREIGN KEY (record_id) REFERENCES parking_records (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- Both demo accounts use the password: password123
INSERT INTO users (username, email, full_name, role, password_hash) VALUES
  ('demo', 'demo@dagupan.edu.ph', 'Demo Manager', 'Parking manager', '$2y$10$9ZXy1Jd0q4Sz6vd7eW/y9u.UNr8zHm8l6GyYXtvUQOeabFE7.c322'),
  ('jamie.lee', 'jamie.lee@dagupan.edu.ph', 'Jamie Lee', 'Parking manager', '$2y$10$9ZXy1Jd0q4Sz6vd7eW/y9u.UNr8zHm8l6GyYXtvUQOeabFE7.c322');

INSERT INTO parking_spaces (id, zone, type, status, rate) VALUES
  ('A1', 'A', 'motorcycle', 'available', 0),
  ('A2', 'A', 'motorcycle', 'occupied', 0),
  ('A3', 'A', 'motorcycle', 'occupied', 0),
  ('A4', 'A', 'motorcycle', 'occupied', 0),
  ('A5', 'A', 'motorcycle', 'occupied', 0),
  ('B1', 'B', 'motorcycle', 'occupied', 0),
  ('B2', 'B', 'motorcycle', 'available', 0),
  ('B3', 'B', 'motorcycle', 'occupied', 0),
  ('B4', 'B', 'motorcycle', 'available', 0),
  ('B5', 'B', 'motorcycle', 'available', 0),
  ('C1', 'C', 'motorcycle', 'occupied', 0),
  ('C2', 'C', 'motorcycle', 'available', 0),
  ('C3', 'C', 'motorcycle', 'occupied', 0),
  ('C4', 'C', 'motorcycle', 'available', 0),
  ('C5', 'C', 'motorcycle', 'occupied', 0);

-- One record per occupied slot, timed today so the dashboard always looks live.
INSERT INTO parking_records (plate, model, slot, driver, contact, classification, student_id, entered_at) VALUES
  ('7DEF456', 'Honda Click 125 - Silver', 'A2', 'Jherome Pontawe', '0917 456 7890', 'Student', '2024-01234', DATE_ADD(CURDATE(), INTERVAL 480 MINUTE)),
  ('9GHJ789', 'Yamaha NMAX - Black', 'A3', 'Jeann Liam A. Racuya', '0917 890 1234', 'School Staff', 'FAC-2001', DATE_ADD(CURDATE(), INTERVAL 485 MINUTE)),
  ('6KLM012', 'Honda PCX 160 - Blue', 'A4', 'Adrian Tenepere', '0917 012 3456', 'Visitor', NULL, DATE_ADD(CURDATE(), INTERVAL 490 MINUTE)),
  ('12HVF24', 'Suzuki Burgman - White', 'A5', 'Ava Patel', '0917 123 4567', 'Student', '2024-02010', DATE_ADD(CURDATE(), INTERVAL 495 MINUTE)),
  ('4TKLG21', 'Yamaha Aerox - Matte Black', 'B1', 'Jamie Lee', '0917 678 9012', 'School Staff', 'FAC-2014', DATE_ADD(CURDATE(), INTERVAL 500 MINUTE)),
  ('5MNO34', 'Honda Beat - Red', 'B3', 'Mark Villanueva', '0917 234 5678', 'Student', '2024-01456', DATE_ADD(CURDATE(), INTERVAL 505 MINUTE)),
  ('8PQR56', 'Yamaha Mio - Pink', 'C1', 'Kyla Ramos', '0917 345 6789', 'Student', '2024-02788', DATE_ADD(CURDATE(), INTERVAL 510 MINUTE)),
  ('3STU78', 'Honda ADV 160 - Gray', 'C3', 'Dante Cruz', '0917 567 8901', 'School Staff', 'FAC-2022', DATE_ADD(CURDATE(), INTERVAL 515 MINUTE)),
  ('2VWX90', 'Kawasaki Rouser - Green', 'C5', 'Carlo Reyes', '0917 789 0123', 'Visitor', NULL, DATE_ADD(CURDATE(), INTERVAL 520 MINUTE));

INSERT INTO parking_history (record_id, event, occurred_at)
SELECT id, 'Vehicle entered', entered_at FROM parking_records;

-- Registered motorists: everyone who has a saved profile (seed entries cover the demo bikes).
INSERT INTO registered_motorists (plate, model, owner, contact, classification, student_id) VALUES
  ('7DEF456', 'Honda Click 125 - Silver', 'Jherome Pontawe', '0917 456 7890', 'Student', '2024-01234'),
  ('9GHJ789', 'Yamaha NMAX - Black', 'Jeann Liam A. Racuya', '0917 890 1234', 'School Staff', 'FAC-2001'),
  ('6KLM012', 'Honda PCX 160 - Blue', 'Adrian Tenepere', '0917 012 3456', 'Visitor', NULL),
  ('12HVF24', 'Suzuki Burgman - White', 'Ava Patel', '0917 123 4567', 'Student', '2024-02010'),
  ('4TKLG21', 'Yamaha Aerox - Matte Black', 'Jamie Lee', '0917 678 9012', 'School Staff', 'FAC-2014'),
  ('5MNO34', 'Honda Beat - Red', 'Mark Villanueva', '0917 234 5678', 'Student', '2024-01456'),
  ('8PQR56', 'Yamaha Mio - Pink', 'Kyla Ramos', '0917 345 6789', 'Student', '2024-02788'),
  ('3STU78', 'Honda ADV 160 - Gray', 'Dante Cruz', '0917 567 8901', 'School Staff', 'FAC-2022'),
  ('2VWX90', 'Kawasaki Rouser - Green', 'Carlo Reyes', '0917 789 0123', 'Visitor', NULL);
