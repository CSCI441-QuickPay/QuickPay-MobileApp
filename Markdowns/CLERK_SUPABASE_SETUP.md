# Clerk + Supabase Integration Setup Guide

This guide explains how to set up and use the Clerk authentication with Supabase database integration for QuickPay.

## Overview

The app now integrates Clerk (authentication) with Supabase (database) to:
1. Authenticate users with Clerk (email/password or OAuth)
2. Automatically sync user data to Supabase when they sign up or log in
3. Store Plaid integration data (access tokens, item IDs) in Supabase
4. Maintain user profiles and financial data in Supabase

## Architecture

```
User Signs Up/Logs In
        ↓
    Clerk Auth
        ↓
  Session Created
        ↓
UserSyncService.syncUserToSupabase()
        ↓
  Supabase Database
        ↓
Ready for Plaid Integration
```

## Setup Steps

### 1. Set Up Supabase Database

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (orptfearwcypftrjkoaa)
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/001_create_users_table.sql`
6. Paste into the SQL editor
7. Click **Run** to execute the migration

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref orptfearwcypftrjkoaa

# Run migration
supabase db push
```

### 2. Verify Database Setup

After running the migration, verify in Supabase Dashboard:

1. Go to **Table Editor**
2. You should see a `users` table with these columns:
   - `id` (UUID, primary key)
   - `clerk_id` (TEXT, unique)
   - `email` (TEXT, unique)
   - `first_name`, `last_name`, `phone_number`, `profile_picture`
   - `balance` (DECIMAL)
   - `is_active`, `verified` (BOOLEAN)
   - **Plaid fields**: `plaid_access_token`, `plaid_item_id`, `plaid_linked_at`
   - `created_at`, `updated_at` (TIMESTAMP)

### 3. Environment Variables

Ensure your `.env` file has these values (already configured):

```env
# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YnJpZWYtY29yZ2ktODguY2xlcmsuYWNjb3VudHMuZGV2JA

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://orptfearwcypftrjkoaa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Plaid (for later use)
EXPO_PUBLIC_PLAID_CLIENT_ID=68bf835c74fc82001df36831
EXPO_PUBLIC_PLAID_SECRET=bae4094563532a57b02156e84aa734
EXPO_PUBLIC_PLAID_ENV=sandbox
```

### 4. Install Dependencies

The Supabase client is already installed. If you need to reinstall:

```bash
cd QuickPay-MobileApp
npm install @supabase/supabase-js
```

## How It Works

### User Signup Flow

1. User fills out signup form (name, email, phone, password)
2. Clerk creates authentication account
3. `StepPassword.tsx` calls `UserSyncService.syncUserToSupabase()`
4. User record is created in Supabase `users` table
5. User is redirected to the app

**Code Location**: `app/(auth)/signup/StepPassword.tsx:68-86`

### User Login Flow

1. User enters email and password (or uses Google OAuth)
2. Clerk authenticates the user
3. `login.tsx` calls `UserSyncService.syncCurrentUser()`
4. If user doesn't exist in Supabase, they're created
5. If user exists, their data is updated
6. User is redirected to home

**Code Locations**:
- Email login: `app/(auth)/login.tsx:59-69`
- OAuth login: `app/(auth)/login.tsx:92-102`

### Data Synchronization

The `UserSyncService` handles syncing:

```typescript
// Create new user
await UserSyncService.syncUserToSupabase({
  clerkId: 'user_xxxxx',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
});
```

**Service Location**: `services/UserSyncService.ts`

## Using the User Model

The `UserModel` provides methods to interact with Supabase:

### Get User by Clerk ID

```typescript
import UserModel from '@/models/UserModel';

const user = await UserModel.getByClerkId(clerkId);
if (user) {
  console.log('User balance:', user.balance);
  console.log('Plaid linked:', user.plaidItemId ? 'Yes' : 'No');
}
```

### Update User Data

```typescript
await UserModel.update(clerkId, {
  firstName: 'Jane',
  phoneNumber: '+9876543210',
});
```

### Update Balance

```typescript
// Set balance directly
await UserModel.updateBalance(clerkId, 1000.50);

// Increment balance
await UserModel.updateBalance(clerkId, undefined, 50.00); // Add $50
```

### Store Plaid Information

```typescript
await UserModel.updatePlaidInfo(
  clerkId,
  'access-sandbox-xxxxx', // Plaid access token
  'item-sandbox-xxxxx'    // Plaid item ID
);
```

## Testing the Integration

### 1. Test Signup

1. Clear app data (or use a new email)
2. Run the app: `npm start`
3. Navigate to Sign Up
4. Complete the signup flow with a new email
5. Check the console for:
   ```
   🔄 Syncing user to Supabase...
   ✅ New user created in Supabase: user@example.com
   ```
6. Verify in Supabase Dashboard → Table Editor → users table
7. You should see a new row with your user data

### 2. Test Login

1. Log out from the app
2. Log in with the same credentials
3. Check console for:
   ```
   🔄 Syncing logged-in user to Supabase...
   ✅ User already exists in Supabase: user@example.com
   ```

### 3. Test OAuth (Google)

1. Click "Sign in with Google"
2. Complete Google authentication
3. User should be synced to Supabase automatically
4. Verify in Supabase Table Editor

### 4. Query User Data

Open Supabase SQL Editor and run:

```sql
-- Get all users
SELECT * FROM users;

-- Get specific user by email
SELECT * FROM users WHERE email = 'your@email.com';

-- Get users with Plaid linked
SELECT * FROM users WHERE plaid_item_id IS NOT NULL;
```

## Next Steps: Plaid Integration

Once user data is in Supabase, you can integrate Plaid:

1. **Link Bank Account**: Use Plaid Link to get `access_token` and `item_id`
2. **Store in Supabase**:
   ```typescript
   await UserModel.updatePlaidInfo(clerkId, accessToken, itemId);
   ```
3. **Fetch Financial Data**: Use the stored `plaid_access_token` to:
   - Get account balances
   - Fetch transactions
   - Pull financial insights
4. **Display in App**: Show user's financial data on the home screen

## Troubleshooting

### User not created in Supabase

**Check:**
- Supabase migration ran successfully
- `.env` variables are correct
- Console logs show sync attempt
- Supabase RLS policies allow inserts

**Fix:**
- Run the migration again
- Check Supabase Dashboard → Authentication → Policies
- Verify network connection to Supabase

### "Missing Supabase environment variables" error

**Fix:**
```bash
# Restart the dev server
npm start
# or
expo start --clear
```

### User created but data is missing

**Check:**
- Signup form collects all required data
- `signupData` object in `StepPassword.tsx` has all fields
- Console logs show what data is being sent

**Fix:**
- Verify `index.tsx` passes data through all signup steps
- Check `nextPage()` calls include the form data

### Plaid fields are null

**This is expected!** Plaid fields will be populated later when:
1. User clicks "Link Bank Account"
2. Plaid Link flow completes
3. `UserModel.updatePlaidInfo()` is called

## Security Considerations

### Current Setup (Development)

Row Level Security (RLS) is enabled but permissive:
- Anyone can read user data
- Anyone can insert/update user data
- Suitable for development only

### Production Setup (TODO)

You should restrict RLS policies to use Clerk JWT:

```sql
-- Example: Users can only read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = clerk_id);

-- Example: Users can only update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = clerk_id);
```

This requires configuring Supabase to validate Clerk JWTs.

## File Structure

```
QuickPay-MobileApp/
├── config/
│   └── supabaseConfig.ts          # Supabase client setup
├── models/
│   └── UserModel.ts                # User database operations
├── services/
│   └── UserSyncService.ts          # Clerk → Supabase sync logic
├── supabase/
│   ├── migrations/
│   │   └── 001_create_users_table.sql  # Database schema
│   └── README.md                   # Supabase setup guide
├── app/
│   └── (auth)/
│       ├── login.tsx               # Login with sync
│       └── signup/
│           └── StepPassword.tsx    # Signup with sync
└── .env                            # Environment variables
```

## Summary

You now have a complete Clerk + Supabase integration that:

✅ Authenticates users with Clerk
✅ Syncs user data to Supabase on signup/login
✅ Stores user profiles in Supabase
✅ Provides fields for Plaid integration
✅ Supports email/password and OAuth authentication

The next step is to implement Plaid bank linking and use the stored user data to fetch and display financial information!
