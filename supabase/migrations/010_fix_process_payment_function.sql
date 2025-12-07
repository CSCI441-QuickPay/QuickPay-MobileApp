-- Fix process_payment function - Drop all versions and recreate with correct signature
-- This resolves the function overloading conflict

-- Drop ALL versions of process_payment function
DROP FUNCTION IF EXISTS process_payment(UUID, VARCHAR, DECIMAL, TEXT, JSONB[]);
DROP FUNCTION IF EXISTS process_payment(UUID, TEXT, JSONB[], DECIMAL, TEXT);
DROP FUNCTION IF EXISTS process_payment(UUID, TEXT, JSONB, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS process_payment(UUID, VARCHAR, JSONB, DECIMAL, TEXT);

-- Create the correct version that matches PaymentService.ts parameter order:
-- p_sender_id, p_recipient_account_number, p_sources, p_total_amount, p_description
CREATE OR REPLACE FUNCTION process_payment(
  p_sender_id UUID,
  p_recipient_account_number TEXT,
  p_sources JSONB,  -- Array of {id, type, amount}
  p_total_amount DECIMAL,
  p_description TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_account_number TEXT;
  v_sender_name TEXT;
  v_source JSONB;
  v_transaction_id UUID;
  v_recipient_name TEXT;
BEGIN
  -- Get sender's account number and name for transaction records
  SELECT account_number, COALESCE(first_name || ' ' || last_name, email)
  INTO v_sender_account_number, v_sender_name
  FROM users
  WHERE id = p_sender_id;

  IF v_sender_account_number IS NULL THEN
    RAISE EXCEPTION 'Sender not found';
  END IF;

  -- Get recipient ID and name
  SELECT id, COALESCE(first_name || ' ' || last_name, email)
  INTO v_recipient_id, v_recipient_name
  FROM users
  WHERE account_number = p_recipient_account_number;

  IF v_recipient_id IS NULL THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  -- Process each payment source
  FOR v_source IN SELECT * FROM jsonb_array_elements(p_sources)
  LOOP
    IF (v_source->>'type')::text = 'quickpay' THEN
      -- Deduct from sender's QuickPay balance
      UPDATE users
      SET balance = balance - (v_source->>'amount')::decimal,
          updated_at = NOW()
      WHERE id = p_sender_id;

      -- Verify sufficient balance
      IF NOT FOUND OR (SELECT balance FROM users WHERE id = p_sender_id) < 0 THEN
        RAISE EXCEPTION 'Insufficient QuickPay balance';
      END IF;
    END IF;

    -- Create debit transaction for sender with NEGATIVE amount
    INSERT INTO transactions (
      user_id,
      bank_account_id,
      amount,
      transaction_type,
      category,
      merchant_name,
      description,
      transaction_date,
      pending,
      title,
      subtitle,
      created_at,
      updated_at
    ) VALUES (
      p_sender_id,
      CASE WHEN (v_source->>'type')::text = 'bank'
        THEN (v_source->>'id')::uuid ELSE NULL END,
      -(v_source->>'amount')::decimal,  -- Negative for debit
      'debit',
      'Transfer',
      v_recipient_name,
      p_description,
      CURRENT_DATE,
      false,
      'Sent to ' || v_recipient_name,
      'From: ' || v_sender_account_number || ' • To: ' || p_recipient_account_number,
      NOW(),
      NOW()
    );
  END LOOP;

  -- Credit recipient QuickPay balance
  UPDATE users
  SET balance = balance + p_total_amount,
      updated_at = NOW()
  WHERE id = v_recipient_id;

  -- Create credit transaction for recipient
  INSERT INTO transactions (
    user_id,
    bank_account_id,
    amount,
    transaction_type,
    category,
    merchant_name,
    description,
    transaction_date,
    pending,
    title,
    subtitle,
    created_at,
    updated_at
  ) VALUES (
    v_recipient_id,
    NULL,
    p_total_amount,
    'credit',
    'Transfer',
    v_sender_name,
    p_description,
    CURRENT_DATE,
    false,
    'Received from ' || v_sender_name,
    'From: ' || v_sender_account_number || ' • To: ' || p_recipient_account_number,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_transaction_id;

  -- Return success with updated balances
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment successful',
    'sender_new_balance', (SELECT balance FROM users WHERE id = p_sender_id),
    'recipient_new_balance', (SELECT balance FROM users WHERE id = v_recipient_id),
    'transaction_id', v_transaction_id
  );
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION process_payment IS 'Process payment from sender to recipient with multiple sources. Debit amounts are negative, credit amounts are positive.';
