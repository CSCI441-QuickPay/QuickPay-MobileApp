# QuickPay Mobile App

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

Built with React Native and Expo for cross-platform compatibility (iOS & Android), QuickPay uses Clerk for authentication and Supabase for backend infrastructure.

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

```
QuickPay-MobileApp/
├── app/                          # Main application screens (Expo Router)
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx             # Login screen
│   │   ├── signup/               # Multi-step signup flow
│   │   │   ├── StepName.tsx      # Step 1: Name input
│   │   │   ├── StepBirthday.tsx  # Step 2: Birthday input
│   │   │   ├── StepPhone.tsx     # Step 3: Phone input
│   │   │   ├── StepEmail.tsx     # Step 4: Email input
│   │   │   └── StepPassword.tsx  # Step 5: Password input
│   │   └── forgot_password.tsx   # Password recovery
│   ├── (main)/                   # Main app screens (after login)
│   │   ├── home.tsx              # Dashboard with transactions
│   │   ├── favorite.tsx          # Favorite contacts management
│   │   ├── profile.tsx           # User profile and settings
│   │   ├── visual_budget.tsx     # Budget visualization
│   │   └── contact_us.tsx        # Support/contact form
│   ├── plaid-onboarding-hosted.tsx  # Plaid bank linking
│   ├── index.tsx                 # Entry point (routing logic)
│   └── _layout.tsx               # Root layout with providers
│
├── components/                   # Reusable UI components
│   ├── home/                     # Home screen components
│   │   ├── BalanceCard.tsx       # Balance display card
│   │   ├── TransactionList.tsx   # Transaction list view
│   │   ├── FilterModal.tsx       # Transaction filters
│   │   ├── Header.tsx            # Home header
│   │   ├── QRCodeModal.tsx       # QR code generator
│   │   └── TransactionItem.tsx   # Single transaction item
│   ├── favorite/                 # Favorites components
│   │   ├── AddFavoriteModal.tsx  # Add favorite form
│   │   └── SplitTransferModal.tsx # Split payment modal
│   ├── profile/                  # Profile components
│   ├── visual_budget/            # Budget components
│   └── BottomNav.tsx             # Bottom navigation bar
│
├── services/                     # Business logic layer
│   ├── UserSyncService.ts        # Clerk-Supabase user sync
│   └── PlaidService.ts           # Plaid API integration
│
├── models/                       # Data models and database operations
│   ├── UserModel.ts              # User CRUD operations
│   └── BudgetModel.ts            # Budget data structures
│
├── config/                       # Configuration files
│   └── supabaseConfig.ts         # Supabase client setup
│
├── supabase/                     # Backend infrastructure
│   ├── functions/                # Edge Functions (Deno)
│   │   ├── plaid-create-link-token/  # Generate Plaid link token
│   │   ├── plaid-exchange-token/     # Exchange public token
│   │   ├── plaid-get-accounts/       # Fetch account info
│   │   ├── plaid-get-transactions/   # Fetch transactions
│   │   └── clerk-webhook/            # Clerk event webhook
│   └── migrations/               # Database migrations
│
├── __tests__/                    # Test files
│   ├── unit/                     # Unit tests
│   │   ├── UserSyncService.test.ts   # UserSyncService tests
│   │   └── PlaidService.test.ts      # PlaidService tests
│   └── integration/              # Integration tests
│       └── AuthFlow.test.ts      # Authentication flow tests
│
├── scripts/                      # Utility scripts
│   ├── export-user-data.js       # GDPR data export
│   └── analyze-data-collection.js # Data collection analysis
│
├── data/                         # Mock/sample data
├── utils/                        # Utility functions
├── assets/                       # Images, fonts, icons
│
├── .env                          # Environment variables (not in git)
├── app.config.js                 # Expo configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── jest.config.js                # Jest testing configuration
├── jest.setup.js                 # Jest setup file
├── package.json                  # NPM dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── DATA_COLLECTION.md            # Data collection documentation
└── README.md                     # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** (v8 or later) or **yarn** - Comes with Node.js
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **iOS Simulator** (Mac only) or **Android Emulator** - [Setup Guide](https://docs.expo.dev/workflow/android-studio-emulator/)
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
   ```

---

## Running the App

### Development Mode

```bash
# Start Expo development server
npm start
# or
expo start
```

This will open the Expo DevTools in your browser. From there, you can:

- Press `i` - Open iOS Simulator (Mac only)
- Press `a` - Open Android Emulator
- Scan QR code with Expo Go app on your phone

### Platform-Specific Commands

```bash
# iOS
npm run ios
# or
expo run:ios

# Android
npm run android
# or
expo run:android
```

### Development Build (Recommended for testing Plaid)

Expo Go has limitations with native modules. For full Plaid functionality, create a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create development build
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

### Test Structure

- **Unit Tests** (`__tests__/unit/`):
  - `UserSyncService.test.ts` - Tests user synchronization between Clerk and Supabase
  - `PlaidService.test.ts` - Tests Plaid API integration

- **Integration Tests** (`__tests__/integration/`):
  - `AuthFlow.test.ts` - Tests complete authentication flow

### Test Coverage

Current test coverage:

- **UserSyncService**: ~95% - Tests data transformation, user creation, updates, error handling
- **PlaidService**: ~90% - Tests transaction fetching, account fetching, data transformation
- **AuthFlow**: ~85% - Tests signup, login, data synchronization, error scenarios

### Data Collection Testing

#### Quick Start - Interactive Script

Run the interactive menu to test data collection:

```bash
# Windows
run-data-collection.bat

# Mac/Linux
chmod +x run-data-collection.sh && ./run-data-collection.sh
```

**Menu Options**:

1. View Data Collection Analysis (console output)
2. Export Analysis to JSON (saves to file)
3. Export User Data by Clerk ID (GDPR compliance)
4. View Help
5. Exit

#### Manual Commands

```bash
# Analyze all data collection points
node scripts/analyze-data-collection.js

# Export analysis to JSON
node scripts/analyze-data-collection.js --export

# Export specific user's data (replace with actual Clerk ID)
node scripts/export-user-data.js user_2a1b2c3d4e5f
```

#### What Gets Tested

**Data Collection Analysis** (`analyze-data-collection.js`):

- ✅ 7 data collection points (signup, login, Plaid, favorites, etc.)
- ✅ 5 storage locations (Supabase, Clerk, SecureStore, AsyncStorage, Memory)
- ✅ 4 external services (Clerk, Plaid, Supabase, Expo)
- ✅ 6 security measures (TLS, bcrypt, RLS, etc.)
- ✅ GDPR & CCPA compliance info

**User Data Export** (`export-user-data.js`):

- ✅ Complete user profile
- ✅ All favorite contacts
- ✅ Account metadata (age, status, Plaid linking)
- ✅ Summary statistics
- ❌ Sensitive tokens (redacted for security)
- ❌ Transactions (not stored in database)

#### Expected Output

**Analysis Output** (console):

```
╔═══════════════════════════════════════════════════╗
║   QUICKPAY DATA COLLECTION ANALYSIS REPORT        ║
╚═══════════════════════════════════════════════════╝

📍 ===== DATA COLLECTION POINTS =====

Total Collection Points: 7

1. User Signup
   Screen: app/(auth)/signup/*
   Data Collected: email, password, firstName, lastName, phoneNumber, birthday
   Storage: Clerk (auth) + Supabase (profile)
   Purpose: Create user account and profile
   Required: Yes
...
```

**User Export Output** (JSON file in `data-exports/`):

```json
{
  "metadata": {
    "exportDate": "2024-10-31T10:30:00Z",
    "clerkId": "user_2a1b2c3d4e5f"
  },
  "user": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "plaid_access_token": "[REDACTED - Token exists]",
    "hasPlaidLinked": true
  },
  "favorites": [...],
  "summary": {
    "totalFavorites": 3,
    "accountAge": "5 days",
    "plaidLinked": true
  }
}
```

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
- ❌ Credit card numbers
- ❌ Social Security numbers
- ❌ Location data
- ❌ Device fingerprinting

#### Data Storage

- **Supabase PostgreSQL**: User profiles, favorites, Plaid tokens (encrypted)
- **Clerk Cloud**: Authentication credentials, OAuth tokens

### Testing Data Collection

#### Export User Data

```bash
# Export all data for a specific user
node scripts/export-user-data.js <clerkId>
```

**Output**: JSON file in `data-exports/` with:

- User profile
- Favorite contacts
- Account metadata
- Summary statistics

---

## API Documentation

### Supabase Edge Functions

All edge functions are located in `supabase/functions/`.

#### 1. plaid-create-link-token

**Purpose**: Generate Plaid Link token for bank linking

**Endpoint**: `POST /functions/v1/plaid-create-link-token`

**Request Body**:

```json
{
  "clerkId": "clerk_user123"
}
```

**Response**:

```json
{
  "link_token": "link-sandbox-abc123..."
}
```

#### 2. plaid-exchange-token

**Purpose**: Exchange Plaid public token for access token

**Endpoint**: `POST /functions/v1/plaid-exchange-token`

**Request Body**:

```json
{
  "publicToken": "public-sandbox-xyz...",
  "clerkId": "clerk_user123"
}
```

**Response**:

```json
{
  "success": true,
  "access_token": "access-sandbox-def456..."
}
```

#### 3. plaid-get-accounts

**Purpose**: Fetch user's bank accounts

**Endpoint**: `POST /functions/v1/plaid-get-accounts`

**Request Body**:

```json
{
  "clerkId": "clerk_user123"
}
```

**Response**:

```json
{
  "accounts": [
    {
      "account_id": "acc123",
      "name": "Plaid Checking",
      "type": "depository",
      "subtype": "checking",
      "balances": {
        "available": 1000,
        "current": 1050
      }
    }
  ]
}
```

#### 4. plaid-get-transactions

**Purpose**: Fetch user's transactions

**Endpoint**: `POST /functions/v1/plaid-get-transactions`

**Request Body**:

```json
{
  "clerkId": "clerk_user123",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response**:

```json
{
  "transactions": [...],
  "accounts": [...]
}
```

## Acknowledgments

- **Expo Team** - For the amazing React Native framework
- **Clerk** - For seamless authentication
- **Supabase** - For powerful backend infrastructure
- **Plaid** - For reliable banking integrations

---

## Changelog

### v1.0.0 (Current) - Demo #1 (October 31, 2024)

**Features Implemented**:

- ✅ User authentication (Clerk) - Email/password
- ✅ Multi-step signup flow (Name → Birthday → Phone → Email → Password)
- ✅ Bank account linking (Plaid integration)
- ✅ Real-time transaction viewing
- ✅ Account balance display
- ✅ Favorites management
- ✅ Visual budget interface (drag-and-drop)
- ✅ User profile and settings
- ✅ QR code generation
- ✅ Transaction filtering and sorting
- ✅ Pull-to-refresh functionality

**Known Issues & Workarounds**:

- ⚠️ Deep link callback issue in Expo Go
  - **Workaround**: Manual token entry field added
  - **Permanent Fix**: Build EAS development version
  - **Documentation**: See WHY_DEEP_LINK_FAILS.md

**Testing**:

- ✅ Unit tests for services (~95% coverage)
- ✅ Integration tests for auth flow (~85% coverage)
- ✅ PlaidService tests (~90% coverage)
- ✅ Overall test coverage: ~90%

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
- ✅ plaid-exchange-token (with comprehensive logging)
- ✅ plaid-get-accounts
- ✅ plaid-get-transactions
- ✅ clerk-webhook

**Current Status**: Testing-ready with minor known issue (deep linking in Expo Go). All core features functional. Plaid integration complete with manual workaround.

---

**Made with ❤️ by the QuickPay Team**

Last Updated: October 31, 2024
