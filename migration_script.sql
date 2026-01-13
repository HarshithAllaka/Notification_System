-- Database Migration Script for Merging staff_users and users tables
-- Run this script BEFORE starting the application after the code changes

-- Step 1: Backup your database (recommended)
-- mysqldump -u root -p nykaa_notifications > backup.sql

-- Step 2: Add new columns to users table
ALTER TABLE users ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST;
ALTER TABLE users ADD COLUMN userId VARCHAR(255) UNIQUE;

-- Step 3: Migrate existing user_id values to userId column
UPDATE users SET userId = user_id WHERE user_id IS NOT NULL;

-- Step 4: Migrate staff_users data to users table
INSERT INTO users (userId, name, email, password, role, isActive)
SELECT CONCAT('staff-', id), name, email, password, role, 1 FROM staff_users;

-- Step 5: Drop the old staff_users table
DROP TABLE staff_users;

-- Step 6: Drop the old user_id column (now redundant)
ALTER TABLE users DROP COLUMN user_id;

-- Step 7: Add new preference columns
ALTER TABLE preferences ADD COLUMN email_offers BOOLEAN DEFAULT TRUE;
ALTER TABLE preferences ADD COLUMN sms_offers BOOLEAN DEFAULT TRUE;
ALTER TABLE preferences ADD COLUMN push_offers BOOLEAN DEFAULT TRUE;
ALTER TABLE preferences ADD COLUMN email_newsletters BOOLEAN DEFAULT TRUE;
ALTER TABLE preferences ADD COLUMN sms_newsletters BOOLEAN DEFAULT TRUE;
ALTER TABLE preferences ADD COLUMN push_newsletters BOOLEAN DEFAULT TRUE;
ALTER TABLE preferences ADD COLUMN email_orders BOOLEAN DEFAULT TRUE;
ALTER TABLE preferences ADD COLUMN sms_orders BOOLEAN DEFAULT TRUE;
ALTER TABLE preferences ADD COLUMN push_orders BOOLEAN DEFAULT TRUE;

-- Step 8: Migrate old preferences to new ones
UPDATE preferences SET 
  email_offers = offers,
  sms_offers = offers,
  push_offers = offers,
  email_newsletters = newsletter,
  sms_newsletters = newsletter,
  push_newsletters = newsletter,
  email_orders = order_updates,
  sms_orders = order_updates,
  push_orders = order_updates
WHERE offers IS NOT NULL OR newsletter IS NOT NULL OR order_updates IS NOT NULL;

-- Step 9: Drop old preference columns
ALTER TABLE preferences DROP COLUMN offers;
ALTER TABLE preferences DROP COLUMN newsletter;
ALTER TABLE preferences DROP COLUMN order_updates;

-- Step 10: Reset auto_increment if needed
ALTER TABLE users AUTO_INCREMENT = 1;

-- Verification queries (run after migration):
-- SELECT id, userId, name, email, role, isActive FROM users;
-- SELECT * FROM preferences;