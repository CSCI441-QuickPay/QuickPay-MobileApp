-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  account_number TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  profile_picture TEXT,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,

  -- Plaid integration fields
  plaid_access_token TEXT,
  plaid_item_id TEXT,
  plaid_linked_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index on clerk_id for faster lookups
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on plaid_item_id for Plaid queries
CREATE INDEX idx_users_plaid_item_id ON users(plaid_item_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true);  -- For now, allow all reads. We'll restrict this based on Clerk auth later.

-- Create policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true);  -- For now, allow all updates. We'll restrict this based on Clerk auth later.

-- Create policy: Allow inserts (for signup)
CREATE POLICY "Allow user creation"
  ON users
  FOR INSERT
  WITH CHECK (true);  -- For now, allow all inserts. We'll restrict this based on Clerk auth later.
