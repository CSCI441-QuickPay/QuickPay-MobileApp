# Supabase Database Setup

## Running Migrations

You need to run the SQL migration to create the users table in your Supabase database.

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (orptfearwcypftrjkoaa)
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of `migrations/001_create_users_table.sql`
6. Click "Run" to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref orptfearwcypftrjkoaa

# Run migrations
supabase db push
```

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| clerk_id | TEXT | Unique Clerk user ID |
| email | TEXT | User email (unique) |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| phone_number | TEXT | User's phone number |
| profile_picture | TEXT | URL to profile picture |
| balance | DECIMAL(10, 2) | User's account balance |
| is_active | BOOLEAN | Whether user is active |
| verified | BOOLEAN | Whether user is verified |
| plaid_access_token | TEXT | Plaid access token for bank linking |
| plaid_item_id | TEXT | Plaid item ID |
| plaid_linked_at | TIMESTAMP | When Plaid was linked |
| created_at | TIMESTAMP | When user was created |
| updated_at | TIMESTAMP | When user was last updated (auto-updated) |

### Indexes

- `idx_users_clerk_id`: Fast lookups by Clerk ID
- `idx_users_email`: Fast lookups by email
- `idx_users_plaid_item_id`: Fast lookups for Plaid queries

### Security

Row Level Security (RLS) is enabled. Current policies allow:
- Users can read all user data
- Users can update all user data
- Anyone can create users (for signup)

**Note**: These policies are permissive for development. You should restrict them based on Clerk authentication in production.
