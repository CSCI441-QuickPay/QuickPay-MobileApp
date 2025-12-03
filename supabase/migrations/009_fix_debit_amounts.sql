-- Fix debit transaction amounts to be negative
-- Currently debit transactions are stored with positive amounts, they should be negative

-- Update all existing debit transactions to have negative amounts
UPDATE transactions
SET amount = -ABS(amount)
WHERE transaction_type = 'debit' AND amount > 0;

-- Add comment explaining the convention
COMMENT ON COLUMN transactions.amount IS 'Transaction amount in USD. Debit transactions are negative, credit transactions are positive.';
