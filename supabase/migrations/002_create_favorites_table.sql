-- =====================================================
-- Create additional tables for QuickPay
-- =====================================================

-- 1. BANK ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plaid_account_id TEXT,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- checking, savings, credit, etc.
  balance DECIMAL(10, 2) DEFAULT 0.00,
  available_balance DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  mask TEXT, -- last 4 digits
  institution_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_plaid_id ON bank_accounts(plaid_account_id);

-- 2. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  plaid_transaction_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type TEXT NOT NULL, -- debit, credit, transfer
  category TEXT,
  merchant_name TEXT,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  pending BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(bank_account_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_plaid_id ON transactions(plaid_transaction_id);

-- 3. FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_favorite UNIQUE(user_id, favorite_user_id),
  CONSTRAINT no_self_favorite CHECK (user_id != favorite_user_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_favorite_user_id ON favorites(favorite_user_id);

-- 4. GROUP EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS group_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  split_type TEXT NOT NULL, -- equal, percentage, custom
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_group_expenses_creator ON group_expenses(creator_user_id);
CREATE INDEX idx_group_expenses_status ON group_expenses(status);

-- 5. GROUP EXPENSE PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS group_expense_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_expense_id UUID NOT NULL REFERENCES group_expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_owed DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0.00,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_participant UNIQUE(group_expense_id, user_id)
);

CREATE INDEX idx_participants_expense_id ON group_expense_participants(group_expense_id);
CREATE INDEX idx_participants_user_id ON group_expense_participants(user_id);

-- 6. ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- low_balance, unusual_activity, payment_reminder, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info', -- info, warning, critical
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_read_status ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- 7. EXTERNAL SERVICE LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS external_service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL, -- plaid, stripe, clerk, etc.
  action TEXT NOT NULL, -- link_bank, create_payment, auth, etc.
  status TEXT NOT NULL, -- success, failure, pending
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_logs_user_id ON external_service_logs(user_id);
CREATE INDEX idx_service_logs_service ON external_service_logs(service_name);
CREATE INDEX idx_service_logs_status ON external_service_logs(status);
CREATE INDEX idx_service_logs_created_at ON external_service_logs(created_at);

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_expenses_updated_at
  BEFORE UPDATE ON group_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Bank Accounts RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bank accounts"
  ON bank_accounts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own bank accounts"
  ON bank_accounts FOR DELETE
  USING (true);

-- Transactions RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (true);

-- Favorites RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites"
  ON favorites FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (true);

-- Group Expenses RLS
ALTER TABLE group_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read group expenses they're involved in"
  ON group_expenses FOR SELECT
  USING (true);

CREATE POLICY "Users can create group expenses"
  ON group_expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can update own group expenses"
  ON group_expenses FOR UPDATE
  USING (true);

CREATE POLICY "Creators can delete own group expenses"
  ON group_expenses FOR DELETE
  USING (true);

-- Group Expense Participants RLS
ALTER TABLE group_expense_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read participants in their group expenses"
  ON group_expense_participants FOR SELECT
  USING (true);

CREATE POLICY "Allow inserting participants"
  ON group_expense_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own participation"
  ON group_expense_participants FOR UPDATE
  USING (true);

-- Alerts RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own alerts"
  ON alerts FOR SELECT
  USING (true);

CREATE POLICY "Allow creating alerts"
  ON alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE
  USING (true);

-- External Service Logs RLS
ALTER TABLE external_service_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own service logs"
  ON external_service_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow creating service logs"
  ON external_service_logs FOR INSERT
  WITH CHECK (true);
