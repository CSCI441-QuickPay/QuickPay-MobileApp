-- Update default QuickPay balance to $500 for new users
-- This ensures all new users start with $500 in their QuickPay account

-- First, update any existing users with $0 balance to $500
UPDATE users
SET balance = 500.00
WHERE balance = 0;

-- Then set the default for all future new users
ALTER TABLE users
ALTER COLUMN balance SET DEFAULT 500.00;

-- Add comment explaining the default
COMMENT ON COLUMN users.balance IS 'QuickPay balance in USD. New users start with $500.00';
