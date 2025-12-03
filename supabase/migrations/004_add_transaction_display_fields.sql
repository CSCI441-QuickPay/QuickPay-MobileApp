-- Add missing display fields to transactions table
-- These fields are used by the process_payment RPC function and TransactionModel

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS split_data JSONB;

-- Add comment
COMMENT ON COLUMN transactions.title IS 'Display title for the transaction (e.g., "Sent to John Doe")';
COMMENT ON COLUMN transactions.subtitle IS 'Display subtitle with account or source info';
COMMENT ON COLUMN transactions.icon IS 'Icon name for transaction display';
COMMENT ON COLUMN transactions.logo IS 'Logo URL for merchant/bank';
COMMENT ON COLUMN transactions.split_data IS 'JSON data for split payment transactions';

-- Create index for split transactions
CREATE INDEX IF NOT EXISTS idx_transactions_split_data ON transactions USING GIN (split_data);
