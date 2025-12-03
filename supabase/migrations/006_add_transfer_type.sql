-- Add transfer_type column to transactions table
-- This distinguishes between different types of transfers:
-- 'quickpay' - instant QuickPay balance transfer
-- 'bank_transfer' - ACH transfer from bank account via Plaid
-- 'plaid_ach' - Real Plaid Transfer API transaction

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transfer_type TEXT DEFAULT 'quickpay';

-- Add plaid_transfer_id to track real Plaid Transfer API transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS plaid_transfer_id TEXT;

-- Create index for transfer type queries
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_type
ON transactions(transfer_type);

-- Create index for plaid transfer ID lookups
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_transfer_id
ON transactions(plaid_transfer_id);

-- Add comment for documentation
COMMENT ON COLUMN transactions.transfer_type IS 'Type of transfer: quickpay (instant), bank_transfer (ACH via Plaid), plaid_ach (real Plaid API)';
COMMENT ON COLUMN transactions.plaid_transfer_id IS 'Plaid Transfer API transaction ID for tracking status';
