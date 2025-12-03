-- Fix transaction_date to use CURRENT_DATE instead of NOW()
-- This ensures the date is stored correctly without timezone/time issues

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
  v_source JSONB;
  v_transaction_id UUID;
  v_recipient_name TEXT;
BEGIN
  -- Get sender's account number for transaction records
  SELECT account_number INTO v_sender_account_number
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

  IF v_recipient_id = p_sender_id THEN
    RAISE EXCEPTION 'Cannot send money to yourself';
  END IF;

  -- Process each payment source
  FOR v_source IN SELECT * FROM jsonb_array_elements(p_sources)
  LOOP
    IF (v_source->>'type')::text = 'quickpay' THEN
      -- Deduct from sender QuickPay balance
      UPDATE users
      SET balance = balance - (v_source->>'amount')::decimal,
          updated_at = NOW()
      WHERE id = p_sender_id
      AND balance >= (v_source->>'amount')::decimal;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient QuickPay balance';
      END IF;

    ELSIF (v_source->>'type')::text = 'bank' THEN
      -- Deduct from bank account balance
      UPDATE bank_accounts
      SET balance = balance - (v_source->>'amount')::decimal,
          available_balance = available_balance - (v_source->>'amount')::decimal,
          updated_at = NOW()
      WHERE id = (v_source->>'id')::uuid
      AND user_id = p_sender_id
      AND available_balance >= (v_source->>'amount')::decimal;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient bank balance';
      END IF;
    END IF;

    -- Create debit transaction for sender (FIXED: use CURRENT_DATE)
    INSERT INTO transactions (
      user_id,
      bank_account_id,
      amount,
      transaction_type,
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
      (v_source->>'amount')::decimal,
      'debit',
      p_description,
      CURRENT_DATE,  -- Fixed: was NOW()
      false,
      'Sent to ' || v_recipient_name,
      'Account: ' || p_recipient_account_number,
      NOW(),
      NOW()
    );
  END LOOP;

  -- Credit recipient QuickPay balance
  UPDATE users
  SET balance = balance + p_total_amount,
      updated_at = NOW()
  WHERE id = v_recipient_id;

  -- Create credit transaction for recipient (FIXED: use CURRENT_DATE)
  INSERT INTO transactions (
    user_id,
    amount,
    transaction_type,
    description,
    transaction_date,
    pending,
    title,
    subtitle,
    created_at,
    updated_at
  ) VALUES (
    v_recipient_id,
    p_total_amount,
    'credit',
    p_description,
    CURRENT_DATE,  -- Fixed: was NOW()
    false,
    'Received Payment',
    'From account: ' || v_sender_account_number,
    NOW(),
    NOW()
  ) RETURNING id INTO v_transaction_id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'message', 'Payment processed successfully'
  );

EXCEPTION WHEN OTHERS THEN
  -- Rollback happens automatically
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_payment IS 'Atomically process multi-source payment from sender to recipient - Updated to use CURRENT_DATE for transaction_date';
