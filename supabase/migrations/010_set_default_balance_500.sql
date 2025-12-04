-- Update default QuickPay balance to $500 for new users
-- This ensures all new users start with $500 in their QuickPay account

ALTER TABLE users
ALTER COLUMN balance SET DEFAULT 500.00;

-- Add comment explaining the default
COMMENT ON COLUMN users.balance IS 'QuickPay balance in USD. New users start with $500.00';
