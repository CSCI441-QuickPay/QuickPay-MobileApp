-- ============================================================================
-- Migration: Add Account Number Auto-Generation
-- Description: Adds account_number column with automatic generation via trigger
-- Format: 10-digit number (e.g., 6131000178, 6131000179, ...)
-- ============================================================================

-- Step 1: Add account_number column (nullable initially for safe migration)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Step 2: Create sequence for account number generation
-- Starting at 6131000179 (next number after existing example: 6131000178)
CREATE SEQUENCE IF NOT EXISTS users_account_number_seq
  START WITH 6131000179
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 20;  -- Cache 20 numbers in memory for performance

-- Step 3: Create function to generate account numbers
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
DECLARE
  next_number BIGINT;
BEGIN
  -- Get next sequence value
  next_number := nextval('users_account_number_seq');

  -- Return as text (10-digit format)
  RETURN next_number::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger function to auto-set account number on INSERT
CREATE OR REPLACE FUNCTION set_account_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if account_number is NULL
  IF NEW.account_number IS NULL THEN
    NEW.account_number := generate_account_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger on INSERT
CREATE TRIGGER trigger_set_account_number
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_account_number();

-- Step 6: Backfill existing users with account numbers
-- This ensures all existing users get account numbers before we add NOT NULL constraint
UPDATE users
SET account_number = generate_account_number()
WHERE account_number IS NULL;

-- Step 7: Add NOT NULL constraint (now safe since all rows have values)
ALTER TABLE users
ALTER COLUMN account_number SET NOT NULL;

-- Step 8: Add UNIQUE constraint to prevent duplicate account numbers
ALTER TABLE users
ADD CONSTRAINT users_account_number_unique UNIQUE (account_number);

-- Step 9: Create index for fast lookups by account number
-- This is important for favorites feature and other account number searches
CREATE INDEX IF NOT EXISTS idx_users_account_number
ON users(account_number);

-- Step 10: Add documentation comment
COMMENT ON COLUMN users.account_number IS
  'Unique 10-digit account number. Auto-generated on insert via trigger.';

-- Migration complete!
-- New users will automatically get account numbers when inserted
-- Existing users have been backfilled with account numbers
