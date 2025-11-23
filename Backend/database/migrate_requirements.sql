-- Migration script to update requirements table with new fields
-- Run this if your requirements table already exists with the old schema
-- 
-- Usage: mysql -u root -p recruitment_platform < migrate_requirements.sql
-- OR in MySQL: source Backend/database/migrate_requirements.sql

USE recruitment_platform;

-- Check and add columns one by one (MySQL doesn't support IF NOT EXISTS in ALTER TABLE)
-- If a column already exists, you'll get an error - that's okay, just continue

-- Add jobTitle (required field)
ALTER TABLE requirements 
ADD COLUMN jobTitle VARCHAR(255) AFTER offer_id;

-- Add optional fields
ALTER TABLE requirements 
ADD COLUMN tags VARCHAR(500) AFTER jobTitle;

ALTER TABLE requirements 
ADD COLUMN jobRole VARCHAR(255) AFTER tags;

ALTER TABLE requirements 
ADD COLUMN minSalary DECIMAL(10, 2) AFTER jobRole;

ALTER TABLE requirements 
ADD COLUMN maxSalary DECIMAL(10, 2) AFTER minSalary;

ALTER TABLE requirements 
ADD COLUMN salaryType ENUM('Yearly', 'Monthly', 'Hourly') AFTER maxSalary;

ALTER TABLE requirements 
ADD COLUMN education VARCHAR(100) AFTER salaryType;

ALTER TABLE requirements 
ADD COLUMN experience VARCHAR(100) AFTER education;

ALTER TABLE requirements 
ADD COLUMN jobType ENUM('CDI', 'CDD', 'Stage', 'Freelance', 'Part-time') AFTER experience;

ALTER TABLE requirements 
ADD COLUMN vacancies INT AFTER jobType;

ALTER TABLE requirements 
ADD COLUMN expirationDate DATE AFTER vacancies;

ALTER TABLE requirements 
ADD COLUMN jobLevel ENUM('Junior', 'Mid-level', 'Senior') AFTER expirationDate;

ALTER TABLE requirements 
ADD COLUMN responsibilities TEXT AFTER jobLevel;

-- If you have existing data, update jobTitle from description
UPDATE requirements SET jobTitle = description WHERE jobTitle IS NULL OR jobTitle = '';

-- Make jobTitle NOT NULL after updating existing data
ALTER TABLE requirements MODIFY COLUMN jobTitle VARCHAR(255) NOT NULL;
