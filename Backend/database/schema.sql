-- Base de données pour plateforme de recrutement
CREATE DATABASE IF NOT EXISTS recruitment_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recruitment_platform;

-- Table User
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('recruiter', 'candidate', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Recruiter
CREATE TABLE IF NOT EXISTS recruiters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    company_email VARCHAR(255) NOT NULL,
    company_address VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Candidate
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    cv VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Admin
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Offer
CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    date_offer DATE NOT NULL,
    date_expiration DATE,
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Requirements (liée à Offer)
CREATE TABLE IF NOT EXISTS requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    jobTitle VARCHAR(255) NOT NULL,
    tags VARCHAR(500),
    jobRole VARCHAR(255),
    minSalary DECIMAL(10, 2),
    maxSalary DECIMAL(10, 2),
    salaryType ENUM('Yearly', 'Monthly', 'Hourly'),
    education VARCHAR(100),
    experience VARCHAR(100),
    jobType ENUM('CDI', 'CDD', 'Stage', 'Freelance', 'Part-time'),
    vacancies INT,
    expirationDate DATE,
    jobLevel ENUM('Junior', 'Mid-level', 'Senior'),
    description TEXT,
    responsibilities TEXT,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Application
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    offer_id INT NOT NULL,
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    date_application TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Notification
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    application_id INT,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read') DEFAULT 'unread',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Payment (liée à Recruiter et optionnellement à Offer)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id INT NOT NULL,
    offer_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
