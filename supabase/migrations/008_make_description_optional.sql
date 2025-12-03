-- Make description field optional in transactions table
-- This allows sending payments without a note

ALTER TABLE transactions
ALTER COLUMN description DROP NOT NULL;

-- Add comment explaining the field is optional
COMMENT ON COLUMN transactions.description IS 'Optional description/note for the transaction';
