# QuickPay Mobile App v1.1

> A React Native mobile banking application with Plaid integration, built with Expo, Clerk authentication, and Supabase backend.

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000020)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [Data Collection](#data-collection)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**QuickPay** is a modern mobile banking application that allows users to:

- Link bank accounts securely via Plaid
- View real-time account balances and transactions
- Manage favorite contacts for quick transfers
- Track spending with transaction categorization
- Generate QR codes for payment requests

Built with React Native and Expo for cross-platform compatibility (iOS & Android).

---

## Features

### ✅ Core Features (Implemented)

#### 🔐 Authentication

- **Email/Password Signup & Login** - Secure user authentication via Clerk
- **Google OAuth** - One-tap sign-in with Google
- **Multi-step Signup Flow** - Name → Birthday → Phone → Email → Password
- **Password Recovery** - Email-based password reset
- **Session Management** - Secure token storage with auto-refresh

#### 🏦 Bank Integration (Plaid)

- **Bank Account Linking** - Connect bank accounts via Plaid Link
- **Real-time Balances** - View current account balances
- **Transaction History** - Fetch and display past transactions (up to 30 days)
- **Multiple Accounts** - Support for checking, savings, and credit accounts
- **Account Filtering** - Filter transactions by account

#### 📊 Transaction Management

- **Transaction List** - View all recent transactions with details
- **Filtering & Sorting** - Filter by time period, bank, or amount
- **Transaction Categorization** - Automatic categorization (Food, Shopping, etc.)
- **Pending vs Completed** - Visual distinction for pending transactions
- **Transaction Details** - View merchant name, date, amount, category

#### 👥 Favorites

- **Contact Management** - Add, edit, delete favorite contacts
- **Quick Transfer** - One-tap access to frequently used contacts
- **Contact Search** - Search favorites by name or nickname
- **Contact Details** - Store name, nickname, email, phone

#### 👤 User Profile

- **Profile Display** - View user information and statistics
- **Account Statistics** - Active cards, favorites count
- **Settings Sections** - Account, Preferences, Support
- **Logout** - Secure session termination

#### 💎 Additional Features

- **QR Code Generation** - Generate payment request QR codes
- **Pull-to-Refresh** - Update transactions with swipe gesture
- **Transaction Actions** - Split, receipt viewing, details
- **Responsive UI** - Optimized for various screen sizes

#### 💡 Visual Budget (Interactive)

- **Drag-and-Drop Interface** - Visual budget management
- **Hierarchical Structure** - Bank → Budget → Categories
- **Real-time Calculations** - Automatic budget tracking
- **Connection Lines** - Visual parent-child relationships
- **Category Management** - Add, edit, delete budget categories

### 🚧 Planned Features (Future Development)

- **Money Transfers** - Send money to contacts
- **Split Payments** - Split bills with friends (UI implemented)
- **Spending Analytics** - Visual spending insights
- **Notifications** - Real-time transaction alerts
- **Receipt Scanning** - OCR for expense tracking
- **Multi-currency Support** - International transactions

---

## Tech Stack

### Frontend

- **[React Native](https://reactnative.dev/)** (0.79.5) - Cross-platform mobile framework
- **[Expo](https://expo.dev/)** (SDK 53) - React Native toolchain and platform
- **[Expo Router](https://docs.expo.dev/router/introduction/)** (5.1.7) - File-based routing
- **[TypeScript](https://www.typescriptlang.org/)** (5.8.3) - Type-safe JavaScript
- **[NativeWind](https://www.nativewind.dev/)** (4.2.1) - Tailwind CSS for React Native

### Authentication

- **[Clerk](https://clerk.com/)** (2.17.3) - User authentication and management
- **[@clerk/clerk-expo](https://www.npmjs.com/package/@clerk/clerk-expo)** - Clerk SDK for Expo

### Backend & Database

- **[Supabase](https://supabase.com/)** (2.78.0) - PostgreSQL database and backend
- **Supabase Edge Functions** - Serverless functions (Deno runtime)

### Banking Integration

- **[Plaid](https://plaid.com/)** - Banking API for account linking and transactions
- **[react-native-plaid-link-sdk](https://www.npmjs.com/package/react-native-plaid-link-sdk)** (12.6.1) - Plaid integration

### UI Components & Libraries

- **[React Native SVG](https://github.com/software-mansion/react-native-svg)** - SVG support
- **[React Native QR Code SVG](https://www.npmjs.com/package/react-native-qrcode-svg)** - QR code generation
- **[Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** - Gradient backgrounds
- **[@expo/vector-icons](https://icons.expo.fyi/)** - Icon library

### Testing

- **[Jest](https://jestjs.io/)** (30.2.0) - JavaScript testing framework
- **[@testing-library/react-native](https://callstack.github.io/react-native-testing-library/)** (13.3.3) - Testing utilities
- **[ts-jest](https://www.npmjs.com/package/ts-jest)** (29.4.5) - TypeScript support for Jest

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Tailwind Prettier Plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)** - Tailwind class sorting

---

## Project Structure

```text
QuickPay-MobileApp/
├── app/                          # Main application screens (Expo Router)
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx             # Login screen
│   │   ├── forgot_password.tsx   # Password recovery
│   │   ├── signup/               # Multi-step signup flow
│   │   │   ├── index.tsx         # Signup entry point
│   │   │   ├── StepName.tsx      # Step 1: Name input
│   │   │   ├── StepBirthday.tsx  # Step 2: Birthday input
│   │   │   ├── StepPhone.tsx     # Step 3: Phone input
│   │   │   ├── StepEmail.tsx     # Step 4: Email input
│   │   │   ├── StepPassword.tsx  # Step 5: Password input
│   │   │   └── StepDone.tsx      # Signup completion
│   │   └── _layout.tsx           # Auth layout wrapper
│   ├── (main)/                   # Main app screens (after login)
│   │   ├── index.tsx             # Main entry/redirect
│   │   ├── home.tsx              # Dashboard with transactions
│   │   ├── favorite.tsx          # Favorite contacts management
│   │   ├── profile.tsx           # User profile and settings
│   │   ├── my_profile.tsx        # Extended profile editing
│   │   ├── my_bank.tsx           # Bank accounts management
│   │   ├── visual_budget.tsx     # Budget visualization
│   │   ├── send.tsx              # Send money screen
│   │   ├── send-confirmation.tsx # Payment confirmation
│   │   ├── request/              # Request money flows
│   │   │   ├── index.tsx         # Request entry
│   │   │   └── qr.tsx            # QR code generation
│   │   ├── qr_scan.tsx           # QR code scanner
│   │   ├── plaid-onboarding-hosted.tsx  # Plaid bank linking
│   │   ├── notification.tsx      # Notifications
│   │   ├── language.tsx          # Language settings
│   │   ├── security.tsx          # Security settings
│   │   ├── term_condition.tsx    # Terms and conditions
│   │   ├── contact_us.tsx        # Support/contact form
│   │   ├── update_phone.tsx      # Phone number update
│   │   └── _layout.tsx           # Main layout with bottom nav
│   ├── index.tsx                 # App entry point (routing logic)
│   ├── test-network.tsx          # Network testing utility
│   └── _layout.tsx               # Root layout with providers
│
├── components/                   # Reusable UI components
│   ├── home/                     # Home screen components
│   ├── favorite/                 # Favorites components
│   ├── send/                     # Send money components
│   ├── request/                  # Request money components
│   ├── profile/                  # Profile components
│   ├── visual_budget/            # Budget components
│   ├── shared/                   # Shared/common components
│   └── BottomNav.tsx             # Bottom navigation bar
│
├── services/                     # Business logic layer
│   ├── UserSyncService.ts        # Clerk-Supabase user sync
│   ├── PlaidService.ts           # Plaid API integration
│   ├── PlaidTransferService.ts   # Plaid transfer operations
│   ├── PaymentService.ts         # Payment processing logic
│   └── profileService.ts         # Profile management
│
├── models/                       # Data models and database operations
│   ├── UserModel.ts              # User CRUD operations
│   ├── FavoriteModel.ts          # Favorites CRUD
│   ├── TransactionModel.ts       # Transaction operations
│   ├── BankAccountModel.ts       # Bank account operations
│   ├── QRCodeModel.ts            # QR code data
│   ├── GroupExpenseModel.ts      # Split payments
│   ├── ExternalServiceLogModel.ts # API logging
│   └── BudgetModel.ts            # Budget data structures
│
├── contexts/                     # React contexts
├── controllers/                  # API controllers
├── config/                       # Configuration files
│   └── supabaseConfig.ts         # Supabase client setup
│
├── supabase/                     # Backend infrastructure
│   ├── functions/                # Edge Functions (Deno)
│   │   ├── plaid-create-link-token/    # Generate Plaid link token
│   │   ├── plaid-exchange-token/       # Exchange public token
│   │   ├── plaid-get-accounts/         # Fetch account info
│   │   ├── plaid-get-transactions/     # Fetch transactions
│   │   ├── plaid-create-transfer/      # Create money transfer
│   │   ├── plaid-get-transfer-status/  # Check transfer status
│   │   └── clerk-webhook/              # Clerk event webhook
│   └── migrations/               # Database migrations
│
├── __tests__/                    # Test files
│   ├── unit/                     # Unit tests (11 tests)
│   │   ├── PlaidService.test.ts  # PlaidService tests (5 tests)
│   │   └── UserSyncService.test.ts # UserSyncService tests (6 tests)
│   └── integration/              # Integration tests (3 tests)
│       └── AuthFlow.test.ts      # Authentication flow tests
│
├── scripts/                      # Utility scripts
│   ├── analyze-data-collection.js # Data collection analysis
│   ├── export-user-data.js       # GDPR data export
│   └── log-transactions.ts       # Transaction logging
│
├── data/                         # Mock/sample data
├── data-exports/                 # Generated export files
├── docs/                         # Documentation files
├── utils/                        # Utility functions
├── types/                        # TypeScript type definitions
├── constants/                    # App constants
├── styles/                       # Styling files
├── assets/                       # Images, fonts, icons
├── backend/                      # Backend utilities
│
├── .env                          # Environment variables (not in git)
├── app.config.js                 # Expo configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── jest.config.js                # Jest testing configuration
├── jest.setup.js                 # Jest setup file
├── package.json                  # NPM dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── DATA_COLLECTION.md            # Data collection documentation
├── TESTS_EXPLAINED_SIMPLE.md     # Testing guide for presentations
├── PRESENTATION_GUIDE.md         # 3-minute presentation guide
└── README.md                     # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** - [Download](https://nodejs.org/)
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **iOS Simulator** (Mac only) - [Setup Guide](https://docs.expo.dev/workflow/ios-simulator/)
- **Android Emulator** - [Setup Guide](https://docs.expo.dev/workflow/android-studio-emulator/)
- **Expo Go App** (optional) - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/QuickPay-MobileApp.git
   cd QuickPay-MobileApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   Create a `.env` file in the root directory:

   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Clerk Configuration
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

   # Plaid Configuration (for edge functions)
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox  # or development, production
   ```

   **How to get these keys:**

   - **Supabase**:
     1. Create account at [supabase.com](https://supabase.com)
     2. Create new project
     3. Go to Settings → API
     4. Copy URL and `anon` key

   - **Clerk**:
     1. Create account at [clerk.com](https://clerk.com)
     2. Create new application
     3. Go to API Keys
     4. Copy Publishable Key

   - **Plaid**:
     1. Create account at [plaid.com](https://plaid.com)
     2. Create new application
     3. Get Client ID and Secret from dashboard
     4. Start with `sandbox` environment for testing

4. **Set up Supabase Database**

   Run the database migrations:

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link to your project
   supabase link --project-ref your-project-ref

   # Push migrations
   supabase db push
   ```

5. **Deploy Supabase Edge Functions**

   ```bash
   # Deploy all functions
   supabase functions deploy plaid-create-link-token
   supabase functions deploy plaid-exchange-token
   supabase functions deploy plaid-get-accounts
   supabase functions deploy plaid-get-transactions
   supabase functions deploy clerk-webhook
   supabase functions deploy plaid-create-transfer
   supabase functions deploy plaid-get-transfer-status
   ```

---

## Running the App

### Development Build (Recommended for testing Plaid)

Expo Go has limitations with native modules. For full Plaid functionality, create a development build:

```bash
# Create development build iOS
npx expo prebuild --clean --platform ios
npx expo run:ios

# Create development build Android
npx expo prebuild --clean --platform android
npx expo run:android
```

---

## Testing

### Test Technologies

- **Jest** (30.2.0) - Testing framework
- **ts-jest** (29.4.5) - TypeScript support
- **@testing-library/react-native** (13.3.3) - Testing utilities
- **React Native preset** - Pre-configured for mobile testing

---

### Test Commands

```bash
# Run all tests
npm test

# Run specific test suites
# Unit tests only (11 tests)
npm run test:unit

# Integration tests only (3 tests)
npm run test:integration 
```

---

### Test Structure

```
__tests__/
├── unit/                              # Unit tests (11 tests)
│   ├── PlaidService.test.ts           # Banking API integration (5 tests)
│   └── UserSyncService.test.ts        # User data sync (6 tests)
└── integration/                       # Integration tests (3 tests)
    └── AuthFlow.test.ts               # Complete auth workflows
```

---

### Unit Tests (11 tests)

#### **PlaidService Tests** (5 tests)

Tests banking integration and data transformation:

1. **fetchPlaidTransactions** - Verifies transaction fetching with date ranges
2. **fetchPlaidAccounts** - Tests account information retrieval
3. **calculateTotalBalance** - Tests balance calculation across multiple accounts
   - Handles Plaid's cent-based amounts (divides by 100)
   - Example: $1000 + $5000 - $250 = $5,750
4. **transformPlaidTransaction** - Tests data format conversion
   - Plaid format: positive amount = expense
   - App format: negative amount = expense
   - Example: Plaid `45.50` → App `-45.50` (expense)
5. **isPlaidLinked** - Checks if user has linked bank account

**Why These Matter**: Ensures transactions and balances display correctly, preventing user confusion and financial errors.

#### **UserSyncService Tests** (6 tests)

Tests user data synchronization between Clerk and Supabase:

1. **getClerkUserData** - Tests data extraction from Clerk user objects
2. **Create New User** - Verifies new user creation with correct defaults
   - Initial balance: $0
   - Status: Active
   - Verified: False
3. **Update Existing User** - Tests updating user information on login
4. **Duplicate Key Handling** - Tests race condition prevention
   - Scenario: Two processes create same user simultaneously
   - Expected: Gracefully continues without crashing
5. **Error Propagation** - Verifies non-duplicate errors are thrown
6. **syncCurrentUser** - Tests the complete sync workflow

**Why These Matter**: Prevents duplicate accounts, data loss, and ensures user data stays synchronized between authentication and database.

---

### Integration Tests (3 tests)

#### **AuthFlow Tests** (3 tests)

Tests complete user journeys from start to finish:

1. **Complete Signup Flow** 🆕

   ```text
   User Form → Clerk Auth → Get Data → Create Database Record → Done
   ```

   - Verifies user created with correct email, balance, status
   - Tests both Clerk ID and email lookups
   - **Why It Matters**: If this breaks, nobody can sign up!

2. **Complete Login Flow** 🔐

   ```text
   Enter Password → Clerk Auth → Find User → Update Info → Access Account
   ```

   - Verifies existing user found and updated
   - Ensures no duplicate creation
   - **Why It Matters**: Returns users must access their existing account

3. **Account Recovery Flow** 🔄

   ```text
   New Device → New Clerk ID → Find by Email → Link Account → No Duplicate
   ```

   - Tests email fallback when Clerk ID lookup fails
   - Prevents duplicate accounts during device switches
   - **Why It Matters**: Users keep their money and transaction history across devices

---

### Data Collection Testing

#### Manual Commands

```bash
# Analyze all data collection points
node scripts/analyze-data-collection.js

# Export analysis to JSON
node scripts/analyze-data-collection.js --export
```

#### What Gets Tested

**User Data Export** (`export-user-data.js`):

- ✅ Complete user profile
- ✅ All favorite contacts
- ✅ Account metadata (age, status, Plaid linking)
- ✅ Summary statistics

#### Finding Your Clerk User ID

**Method 1** - From App:

1. Open QuickPay app
2. Go to Profile screen
3. Clerk ID shown in debug mode (or check logs)

**Method 2** - From Clerk Dashboard:

1. Go to [clerk.com](https://clerk.com)
2. Navigate to Users
3. Find your user
4. Copy the user ID (format: `user_2a1b2c3d4e5f...`)

**Method 3** - From Supabase:

1. Open Supabase dashboard
2. Go to Table Editor → users
3. Find the `clerk_id` column

#### Troubleshooting

**Error: "Missing environment variables"**

- Ensure `.env` file exists with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Error: "No user found"**

- Verify Clerk ID is correct (format: `user_...`)
- Check if user was synced to Supabase (log in once to trigger sync)

**Error: "Could not fetch favorites"**

- This is a warning, not an error
- User may have no favorites (normal)
- Check Supabase RLS policies if persists

**No output from scripts**

- Check Node.js version (need v18+)
- Verify scripts exist in `scripts/` folder
- Run with `node --version` to check installation

---

## Data Collection

QuickPay is committed to transparency about data collection and usage.

### Quick Overview

#### What We DON'T Collect

- ❌ Bank passwords (handled by Plaid)
- ❌ Card numbers
- ❌ Social Security numbers
- ❌ Location data
- ❌ Device fingerprinting

#### Data Storage

- **Supabase PostgreSQL**: User profiles, favorites, Plaid tokens (encrypted)
- **Clerk Cloud**: Authentication credentials, OAuth tokens

---

## Changelog

### v1.1 (Current)

**Features Implemented**:

- ✅ User authentication (Clerk) - Email/password
- ✅ Multi-step signup flow (Name → Birthday → Phone → Email → Password)
- ✅ Bank account linking (Plaid integration)
- ✅ Real-time transaction viewing
- ✅ Account balance display
- ✅ Favorites management
- ✅ Visual budget interface
- ✅ User profile and settings
- ✅ QR code generation
- ✅ Transaction filtering and sorting
- ✅ Pull-to-refresh functionality

**Known Issues & Workarounds**:

- ⚠️ Deep link callback issue in Expo Go
  - **Permanent Fix**: Build development version

**Testing**:

- ✅ 14 comprehensive tests (all passing in ~3.6 seconds)
- ✅ Unit tests: PlaidService (5 tests), UserSyncService (6 tests)
- ✅ Integration tests: AuthFlow (3 tests - signup, login, recovery)
- ✅ Test coverage: ~90% (UserSyncService: 95%, PlaidService: 90%, AuthFlow: 90%)
- ✅ Edge case testing: race conditions, duplicate prevention, error handling

**Documentation**:

- ✅ Comprehensive README.md
- ✅ Architecture analysis document
- ✅ API documentation
- ✅ Inline code comments throughout

**Data Collection & Privacy**:

- ✅ Transparent data practices documented
- ✅ User data export functionality

**Edge Functions Deployed**:

- ✅ plaid-create-link-token
- ✅ plaid-exchange-token
- ✅ plaid-get-accounts
- ✅ plaid-get-transactions
- ✅ clerk-webhook
- ✅ plaid-create-transfer
- ✅ plaid-get-transfer-status

**Current Status**: Testing-ready with Development Build. All core features functional. Plaid integration complete with manual workaround.

---

**Made with ❤️ by the QuickPay Team**

Last Updated: December 3, 2024
