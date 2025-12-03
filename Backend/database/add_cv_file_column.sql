-- Migration script to add cv_file column to applications table
-- Run this if your applications table already exists without the cv_file column
-- 
-- Usage: mysql -u root -p recruitment_platform < Backend/database/add_cv_file_column.sql
-- OR in MySQL: source Backend/database/add_cv_file_column.sql

USE recruitment_platform;

-- Add cv_file column to store CV as base64 data
ALTER TABLE applications 
ADD COLUMN cv_file LONGTEXT NULL AFTER cover_letter;

-- Verify the column was added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'recruitment_platform' 
AND TABLE_NAME = 'applications' 
AND COLUMN_NAME = 'cv_file';


