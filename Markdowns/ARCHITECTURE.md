# QuickPay Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         QuickPay Mobile App                      │
│                      (React Native / Expo)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────▼────────┐      ┌──────▼──────┐
            │  Clerk Auth    │      │  Supabase   │
            │  (Auth Layer)  │      │  (Database) │
            └───────┬────────┘      └──────┬──────┘
                    │                       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼────────────┐
                    │   User Data Stored     │
                    │   with Plaid Fields    │
                    └────────────────────────┘
```

## Authentication Flow

### Signup Flow

```
User Opens App
     │
     ▼
Fill Signup Form
(Name, Email, Phone, Password)
     │
     ▼
┌────────────────────┐
│  Clerk Sign Up     │  ◄── Creates user in Clerk
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Session Created   │
└────────┬───────────┘
         │
         ▼
┌───────────────────────────┐
│ UserSyncService.sync()    │  ◄── Syncs to Supabase
└────────┬──────────────────┘
         │
         ▼
┌────────────────────┐
│  User Record in    │
│  Supabase Created  │  ◄── Stores: email, name, phone, clerk_id
└────────┬───────────┘
         │
         ▼
   Redirect to Home
```

### Login Flow

```
User Enters Credentials
     │
     ▼
┌────────────────────┐
│  Clerk Login       │  ◄── Validates credentials
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Session Created   │
└────────┬───────────┘
         │
         ▼
┌───────────────────────────┐
│ UserSyncService.sync()    │  ◄── Ensures user in Supabase
└────────┬──────────────────┘
         │
         ▼
┌────────────────────┐
│  Check Supabase    │
└────────┬───────────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    │    Create User
    │         │
    └────┬────┘
         │
         ▼
   Redirect to Home
```

## Data Layer Architecture

### User Data Model

```
┌─────────────────────────────────────────────────────────────┐
│                      Clerk User Data                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • ID (clerk_id)                                     │   │
│  │  • Email                                             │   │
│  │  • Name                                              │   │
│  │  • Phone                                             │   │
│  │  • Profile Picture                                   │   │
│  │  • Session Management                                │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Synced via UserSyncService
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase User Table                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Core Fields:                                        │   │
│  │    • id (UUID, primary key)                          │   │
│  │    • clerk_id (links to Clerk)                       │   │
│  │    • email                                           │   │
│  │    • first_name, last_name                           │   │
│  │    • phone_number                                    │   │
│  │    • profile_picture                                 │   │
│  │    • balance                                         │   │
│  │    • is_active, verified                             │   │
│  │                                                       │   │
│  │  Plaid Integration Fields:                           │   │
│  │    • plaid_access_token  ◄── For API calls          │   │
│  │    • plaid_item_id       ◄── Bank link ID           │   │
│  │    • plaid_linked_at     ◄── When linked            │   │
│  │                                                       │   │
│  │  Timestamps:                                         │   │
│  │    • created_at                                      │   │
│  │    • updated_at (auto-updates)                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Service Layer

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layer                             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login      │  │    Signup    │  │     Home     │      │
│  │   Screen     │  │    Flow      │  │    Screen    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────┬───────┴──────────┬───────┘
                     │                  │
          ┌──────────▼──────────┐      │
          │  UserSyncService    │      │
          │  • syncUserToSupabase()    │
          │  • syncCurrentUser()       │
          └──────────┬──────────┘      │
                     │                  │
          ┌──────────▼──────────┐  ┌───▼──────────┐
          │    UserModel        │  │ PlaidService │
          │  • create()         │  │ (Future)     │
          │  • getByClerkId()   │  └──────────────┘
          │  • update()         │
          │  • updateBalance()  │
          │  • updatePlaidInfo()│
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  Supabase Client    │
          │  (config/supabaseConfig.ts)
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  Supabase Database  │
          │  (PostgreSQL)       │
          └─────────────────────┘
```

## Future: Plaid Integration Flow

```
User Clicks "Link Bank"
     │
     ▼
┌────────────────────────┐
│  Request Link Token    │  ◄── Backend creates Plaid link token
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│   Open Plaid Link      │  ◄── Modal opens
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  User Selects Bank     │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  User Authenticates    │  ◄── Enters bank credentials
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Plaid Returns         │
│  public_token          │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Backend Exchanges     │  ◄── POST /exchange-public-token
│  for access_token      │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  UserModel.            │
│  updatePlaidInfo()     │  ◄── Store in Supabase
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Fetch Account Data    │  ◄── Use access_token
│  via Plaid API         │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Display Balances &    │
│  Transactions in App   │
└────────────────────────┘
```

## Database Relationships (Future)

```
┌──────────────────┐
│     Users        │
│  clerk_id (PK)   │
└────────┬─────────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────┐
│   Accounts       │  ◄── Bank accounts from Plaid
│  (Future Table)  │
│  • user_id (FK)  │
│  • account_id    │
│  • balance       │
│  • type          │
└────────┬─────────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────┐
│  Transactions    │  ◄── Transaction history from Plaid
│  (Future Table)  │
│  • account_id(FK)│
│  • amount        │
│  • category      │
│  • date          │
└──────────────────┘
```

## Component Hierarchy

```
App
│
├── (auth)
│   ├── login.tsx                    ◄── Uses UserSyncService
│   ├── signup/
│   │   ├── index.tsx                ◄── Signup flow orchestrator
│   │   ├── StepEmail.tsx
│   │   ├── StepPassword.tsx         ◄── Uses UserSyncService
│   │   └── StepDone.tsx
│   └── forgot_password.tsx
│
└── (main)
    ├── home.tsx                     ◄── Will use PlaidService
    ├── favorite.tsx
    ├── profile.tsx                  ◄── Shows user data from Supabase
    └── visual_budget.tsx            ◄── Will use transaction data
```

## API Flow

### Current: User Creation

```
Frontend                    Backend (Clerk)         Database (Supabase)
   │                             │                          │
   │──── Sign Up ────────────────▶│                          │
   │                             │                          │
   │◀─── Session Created ────────│                          │
   │                             │                          │
   │──── syncUserToSupabase() ───┼──────────────────────────▶│
   │                             │                          │
   │◀─── User Created ───────────┼──────────────────────────│
   │                             │                          │
```

### Future: Plaid Integration

```
Frontend                Backend                 Plaid API            Supabase
   │                       │                        │                   │
   │─── Link Bank ─────────▶│                        │                   │
   │                       │                        │                   │
   │                       │─── Create Link Token ──▶│                   │
   │                       │                        │                   │
   │                       │◀── Link Token ─────────│                   │
   │                       │                        │                   │
   │◀── Link Token ────────│                        │                   │
   │                       │                        │                   │
   │─── User Auth in Bank ───────────────────────────▶│                  │
   │                       │                        │                   │
   │◀── Public Token ──────────────────────────────│                   │
   │                       │                        │                   │
   │─── Exchange Token ────▶│                        │                   │
   │                       │                        │                   │
   │                       │─── Exchange Token ──────▶│                  │
   │                       │                        │                   │
   │                       │◀── Access Token ────────│                   │
   │                       │                        │                   │
   │                       │─── Store Token ─────────┼───────────────────▶│
   │                       │                        │                   │
   │◀── Success ───────────│                        │                   │
   │                       │                        │                   │
   │─── Get Balances ──────▶│                        │                   │
   │                       │                        │                   │
   │                       │─── Get Access Token ────┼───────────────────▶│
   │                       │                        │                   │
   │                       │◀── Access Token ────────┼───────────────────│
   │                       │                        │                   │
   │                       │─── Fetch Balances ──────▶│                  │
   │                       │                        │                   │
   │                       │◀── Account Data ────────│                   │
   │                       │                        │                   │
   │◀── Display Balances ──│                        │                   │
   │                       │                        │                   │
```

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
│                                                           │
│  ┌────────────────────────────────────────────────┐     │
│  │  Layer 1: Clerk Authentication                 │     │
│  │  • Email/Password with secure hashing          │     │
│  │  • OAuth (Google)                              │     │
│  │  • Session management with JWTs                │     │
│  │  • MFA support (future)                        │     │
│  └────────────────────────────────────────────────┘     │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────┐     │
│  │  Layer 2: Supabase RLS (Row Level Security)   │     │
│  │  • User can only access their own data         │     │
│  │  • Policy: auth.uid() = clerk_id               │     │
│  │  • Prevents unauthorized data access           │     │
│  └────────────────────────────────────────────────┘     │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────┐     │
│  │  Layer 3: API Security                         │     │
│  │  • HTTPS only                                  │     │
│  │  • Backend validates Clerk session             │     │
│  │  • Plaid tokens stored server-side only        │     │
│  └────────────────────────────────────────────────┘     │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────┐     │
│  │  Layer 4: Data Encryption                      │     │
│  │  • Sensitive data encrypted at rest            │     │
│  │  • TLS for data in transit                     │     │
│  │  • Consider encrypting plaid_access_token      │     │
│  └────────────────────────────────────────────────┘     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

1. **Clerk for Auth**: Industry-standard authentication with minimal setup
2. **Supabase for Database**: PostgreSQL with real-time capabilities
3. **Clerk ID as Foreign Key**: Links Clerk users to Supabase records
4. **UserSyncService**: Ensures data consistency between systems
5. **Plaid Fields in User Table**: Simple design, easy to extend
6. **Automatic Sync**: Users created in Supabase on signup/login

## Scalability Considerations

- **User Table**: Can handle millions of users with proper indexing
- **Plaid Tokens**: Consider token refresh strategy for long-term usage
- **Transaction Data**: Plan for separate tables as data grows
- **Caching**: Implement Redis for frequently accessed data
- **Rate Limiting**: Protect against API abuse
- **Background Jobs**: Use webhooks instead of polling for updates
