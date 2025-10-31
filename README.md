# QuickPay - Smart Financial Management App

A comprehensive mobile financial management application built with React Native, Expo, and modern cloud services. QuickPay helps users track transactions, manage budgets visually, split bills, and organize favorite contacts for seamless money transfers.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Available Scripts](#available-scripts)
- [Key Components](#key-components)
- [Documentation](#documentation)
- [Development Status](#development-status)

## Overview

QuickPay is a full-stack mobile application designed for comprehensive financial management. It combines transaction tracking, visual budget planning, bill splitting, and payment functionality in a beautiful, intuitive interface. The app demonstrates modern mobile development practices including:

- Secure authentication with OAuth support
- Real-time database synchronization
- Interactive data visualizations
- Microservices-ready architecture
- Production-ready payment integrations

**Current Version:** 1.0.0
**Target Platforms:** iOS, Android, Web

## Features

### Authentication & User Management
- Multi-step signup flow with smooth animations (name, birthday, phone, email, password)
- Email/password and Google OAuth authentication via Clerk
- Automatic user synchronization between Clerk (auth) and Supabase (database)
- Secure token storage using Expo Secure Store
- Forgot password and account recovery

### Transaction Management
- Transaction list with advanced filtering (time, bank, sort order)
- Transaction categorization and source tracking
- Balance calculation from transaction history
- Transaction details modal with multiple actions:
  - Edit budget allocation
  - Add remarks/notes
  - Export receipts as PDF
  - Return/refund transactions
  - Split transactions with friends

### Split Transaction System
- Create split bills with multiple participants
- Generate unique 6-character split codes (e.g., "AB3XY9")
- Track payment status for each person
- View split summaries and detailed breakdowns
- Copy and share split links
- Payment status indicators (pending, paid, overdue)

### Visual Budget Management
- Interactive drag-and-drop budget tree visualization
- Three node types:
  - **Banks** (blue) - Money source accounts (Chase, Wells Fargo, BofA, Citi)
  - **Budget** (dark gray) - Total budget container
  - **Categories** (various colors) - Spending categories with subcategories
- Features:
  - Add, edit, and delete budget categories
  - Reorganize hierarchy by dragging nodes
  - View transaction history per category
  - Real-time spending vs. budget tracking
  - Zoom and focus controls
  - Pre-built category templates (essentials, lifestyle, financial)
- Sample categories: Rent ($1,000), Utilities ($100), Living ($100 with subcategories)

### Favorites & Contacts
- Save favorite contacts with full details (name, nickname, phone, email)
- Color-coded avatars with initials
- Search and filter functionality
- Bulk edit mode
- Quick send money and split transfer actions

### Profile & Settings
- User information display (name, email, Clerk ID)
- Statistics cards (active cards, favorites count)
- Settings sections:
  - **Account:** My Profile, Security, Cards
  - **Preferences:** Notifications, Language
  - **Support:** Contact Us, Terms & Conditions
- Secure logout functionality

### Additional Features
- QR code generation for payment requests
- Contact form with email integration
- Bottom tab navigation across main screens
- Personalized header with user greeting and notifications
- Haptic feedback for enhanced UX
- Copy-to-clipboard functionality

## Technology Stack

### Frontend
- **React Native** 0.79.5 - Cross-platform mobile framework
- **React** 19.0.0 - UI library
- **Expo** ~53.0.23 - Development platform and build tooling
- **TypeScript** 5.8.3 - Type-safe JavaScript
- **Expo Router** 5.1.7 - File-based routing system

### Styling
- **NativeWind** 4.2.1 - TailwindCSS for React Native
- **TailwindCSS** 3.4.18 - Utility-first CSS framework
- **Expo Linear Gradient** - Gradient effects
- Color scheme: Primary (#00332d - dark green), Secondary (#ccf8f1 - light teal)

### Authentication & Security
- **Clerk** (@clerk/clerk-expo 2.17.3) - Complete authentication solution
  - Email/password authentication
  - Google OAuth integration
  - Session management
  - Secure token storage (expo-secure-store)

### Database & Backend
- **Supabase** (@supabase/supabase-js 2.78.0) - PostgreSQL database with real-time capabilities
  - Row Level Security (RLS) enabled
  - Custom user models with Clerk integration
  - Migration system for schema versioning
- **Prisma** 6.18.0 - Database ORM (additional option)
- **Firebase** 11.10.0 - Legacy/additional cloud services

### Financial Services (Ready for Integration)
- **Plaid** - Bank account linking (sandbox configured)
- **Stripe** - Payment processing infrastructure

### UI & Interaction Libraries
- **@expo/vector-icons** 14.1.0 - Icon sets (Ionicons, MaterialIcons, AntDesign)
- **react-native-reanimated** 3.17.4 - High-performance animations
- **react-native-gesture-handler** 2.24.0 - Touch gestures
- **react-native-qrcode-svg** 6.3.16 - QR code generation
- **expo-haptics** - Haptic feedback
- **expo-clipboard** - Clipboard operations
- **expo-print** - PDF generation and printing

### Development Tools
- **ESLint** 9.25.0 - Code linting
- **Prettier** with Tailwind plugin - Code formatting
- **Babel** - JavaScript transpilation

## Project Structure

```
QuickPay/
├── app/                          # Main application screens (Expo Router)
│   ├── (auth)/                   # Authentication flow
│   │   ├── signin.tsx           # Login screen
│   │   ├── signup/              # Multi-step signup
│   │   │   ├── index.tsx
│   │   │   ├── StepName.tsx
│   │   │   ├── StepBirthday.tsx
│   │   │   ├── StepPhone.tsx
│   │   │   ├── StepEmail.tsx
│   │   │   ├── StepPassword.tsx
│   │   │   └── StepDone.tsx
│   │   └── forgotpassword.tsx
│   ├── (main)/                   # Main app screens
│   │   ├── home.tsx             # Transaction list & balance
│   │   ├── visual_budget.tsx    # Budget tree visualization
│   │   ├── favorite.tsx         # Favorite contacts
│   │   ├── profile.tsx          # User profile & settings
│   │   └── contact.tsx          # Contact support
│   ├── _layout.tsx              # Root layout with providers
│   └── index.tsx                # Entry point
├── components/                   # Reusable UI components
│   ├── home/                    # Home screen components
│   │   ├── BalanceCard.tsx
│   │   ├── TransactionCard.tsx
│   │   ├── TransactionDetailModal.tsx
│   │   ├── SplitModal.tsx
│   │   └── FilterModal.tsx
│   ├── visual_budget/           # Budget tree components
│   │   ├── BudgetPlayground.tsx
│   │   ├── BudgetNode.tsx
│   │   ├── AddCategoryModal.tsx
│   │   └── CategoryDetailModal.tsx
│   ├── favorite/                # Favorites components
│   │   ├── FavoriteCard.tsx
│   │   └── AddFavoriteModal.tsx
│   ├── profile/                 # Profile components
│   │   ├── ProfileHeader.tsx
│   │   ├── StatsCard.tsx
│   │   └── SettingsSection.tsx
│   ├── Header.tsx               # App header
│   └── BottomNav.tsx            # Bottom navigation
├── models/                       # Data models & database operations
│   ├── UserModel.ts             # User CRUD with Clerk integration
│   ├── BudgetModel.ts           # Budget tree operations
│   ├── TransactionModel.ts      # Transaction management
│   ├── FavoriteModel.ts         # Favorite contacts
│   ├── GroupExpenseModel.ts     # Split transactions
│   ├── BankAccountModel.ts      # Bank account linking
│   ├── AlertModel.ts            # User notifications
│   └── ExternalServiceLogModel.ts # API logging
├── services/                     # Business logic services
│   ├── UserSyncService.ts       # Clerk ↔ Supabase sync
│   ├── PlaidService.ts          # Bank linking service
│   └── StripeService.ts         # Payment processing
├── controllers/                  # Business logic controllers
│   └── userController.ts
├── config/                       # Configuration files
│   └── supabase.ts              # Supabase client setup
├── data/                         # Mock/static data
│   ├── transaction.tsx          # Sample transactions
│   ├── budget.tsx               # Budget categories
│   ├── favorites.tsx            # Sample contacts
│   └── user.tsx                 # User stats
├── backend/                      # Backend API structure
│   ├── controllers/
│   ├── routes/
│   └── middlewares/
├── supabase/                     # Database migrations
│   └── migrations/
│       └── 001_create_users_table.sql
├── Markdowns/                    # Comprehensive documentation
│   ├── ARCHITECTURE.md
│   ├── INTEGRATION_SUMMARY.md
│   ├── CLERK_SUPABASE_SETUP.md
│   ├── PLAID_INTEGRATION_GUIDE.md
│   └── QUICK_START_CHECKLIST.md
├── app.json                      # Expo configuration
├── tailwind.config.js           # TailwindCSS configuration
├── tsconfig.json                # TypeScript configuration
├── .env                         # Environment variables
└── package.json                 # Dependencies and scripts
```

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Expo Go** app (for testing on physical devices)
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QuickPay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:
   ```env
   # Clerk Authentication
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

   # Supabase Database
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Plaid (Sandbox)
   EXPO_PUBLIC_PLAID_CLIENT_ID=your_plaid_client_id
   EXPO_PUBLIC_PLAID_SECRET=your_plaid_secret
   EXPO_PUBLIC_PLAID_ENV=sandbox

   # Stripe
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

   # Database (Optional - Prisma)
   DATABASE_URL=your_database_url
   ```

4. **Set up Supabase database**

   Run the migration script to create the users table:
   ```bash
   # Copy SQL from supabase/migrations/001_create_users_table.sql
   # Execute in Supabase SQL Editor
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on your platform of choice**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app for physical device

## Environment Setup

### Clerk Setup (Authentication)
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Enable Email/Password and Google OAuth
4. Copy publishable key to `.env`

### Supabase Setup (Database)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run migration from `supabase/migrations/001_create_users_table.sql`
4. Copy project URL and anon key to `.env`
5. Enable Row Level Security (RLS) in Table Editor

### Plaid Setup (Optional - Bank Linking)
1. Create account at [plaid.com](https://plaid.com)
2. Get sandbox credentials
3. Copy client ID and secret to `.env`
4. See `Markdowns/PLAID_INTEGRATION_GUIDE.md` for implementation

### Stripe Setup (Optional - Payments)
1. Create account at [stripe.com](https://stripe.com)
2. Get publishable key from dashboard
3. Copy to `.env`

## Architecture

### Authentication Flow
```
User Signup/Login → Clerk (Auth Provider) → UserSyncService → Supabase (User Record) → App Access
```

### Data Flow
```
UI Components → Models (Data Layer) → Supabase Client → PostgreSQL Database
```

### Service Architecture
- **UserSyncService**: Syncs authentication state between Clerk and Supabase
- **PlaidService**: Handles bank account linking (ready for implementation)
- **StripeService**: Manages payment processing (stub implementation)

### Key Design Patterns
- **Model-View Pattern**: Separation of data logic (models) from UI (components)
- **Service Layer**: Business logic isolated in reusable services
- **Provider Pattern**: Context providers for auth (Clerk) and data
- **Component Composition**: Reusable, composable UI components

## Database Schema

### Users Table (Supabase PostgreSQL)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  profile_picture TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  plaid_access_token TEXT,
  plaid_item_id TEXT,
  plaid_linked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plaid_item_id ON users(plaid_item_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

See `supabase/migrations/` for complete schema.

## Available Scripts

```bash
# Development
npm start              # Start Expo dev server with options menu
npm run android        # Run on Android emulator/device
npm run ios            # Run on iOS simulator/device
npm run web            # Run in web browser

# Code Quality
npm run lint           # Run ESLint to check code quality

# Project Management
npm run reset-project  # Move starter code to app-example/
```

## Key Components

### UserSyncService
Automatically synchronizes user data between Clerk (authentication) and Supabase (database):
- Creates Supabase record on first Clerk login
- Updates user information on changes
- Handles Plaid integration fields
- See: [services/UserSyncService.ts](services/UserSyncService.ts)

### UserModel
Provides complete CRUD operations for user data:
- `create(userData)` - Create new user
- `findByClerkId(clerkId)` - Lookup by Clerk ID
- `findByEmail(email)` - Lookup by email
- `update(clerkId, updates)` - Update user data
- `updateBalance(clerkId, newBalance)` - Update balance
- `linkPlaid(clerkId, plaidData)` - Link bank account
- See: [models/UserModel.ts](models/UserModel.ts)

### BudgetPlayground
Interactive drag-and-drop budget tree visualization:
- Hierarchical node structure (banks → budget → categories)
- Real-time balance updates
- Category management (add, edit, delete)
- Transaction tracking per category
- See: [components/visual_budget/BudgetPlayground.tsx](components/visual_budget/BudgetPlayground.tsx)

### TransactionDetailModal
Comprehensive transaction management:
- View full transaction details
- Edit budget allocation
- Add remarks/notes
- Export PDF receipts
- Process returns/refunds
- Create split transactions
- See: [components/home/TransactionDetailModal.tsx](components/home/TransactionDetailModal.tsx)

## Documentation

Comprehensive documentation is available in the `Markdowns/` directory:

- **[ARCHITECTURE.md](Markdowns/ARCHITECTURE.md)** - System architecture and data flow diagrams
- **[INTEGRATION_SUMMARY.md](Markdowns/INTEGRATION_SUMMARY.md)** - Clerk + Supabase integration details
- **[CLERK_SUPABASE_SETUP.md](Markdowns/CLERK_SUPABASE_SETUP.md)** - Complete setup and testing guide
- **[PLAID_INTEGRATION_GUIDE.md](Markdowns/PLAID_INTEGRATION_GUIDE.md)** - Bank linking implementation steps
- **[QUICK_START_CHECKLIST.md](Markdowns/QUICK_START_CHECKLIST.md)** - Getting started checklist

## Development Status

### Completed Features
- Full authentication system with Clerk (email/password + Google OAuth)
- Supabase database integration with RLS
- User synchronization service (Clerk ↔ Supabase)
- Transaction list with filtering and sorting
- Visual budget tree with drag-and-drop
- Split transaction UI and code generation
- Favorites management system
- Profile and settings screens
- QR code generation for payments
- PDF receipt export

### Ready for Implementation
- Plaid bank account linking (infrastructure complete, API integration needed)
- Stripe payment processing (keys configured, endpoints needed)
- Real transaction data from Plaid
- Backend API endpoints (structure exists)
- Webhook integrations for real-time updates

### Currently Using Mock Data
Transaction list, budget categories, user statistics, and favorites currently use static data from `data/` directory. These will be replaced with real data once Plaid integration is completed.

---

## Learn More

### Expo Documentation
- [Expo Documentation](https://docs.expo.dev/) - Learn fundamentals and advanced topics
- [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing system
- [Expo SDK](https://docs.expo.dev/versions/latest/) - Complete API reference

### Technology Documentation
- [React Native](https://reactnative.dev/docs/getting-started) - Cross-platform mobile framework
- [Clerk](https://clerk.com/docs) - Authentication and user management
- [Supabase](https://supabase.com/docs) - PostgreSQL database and backend
- [NativeWind](https://www.nativewind.dev/) - TailwindCSS for React Native
- [Plaid](https://plaid.com/docs/) - Bank account linking
- [Stripe](https://stripe.com/docs) - Payment processing

### Support & Community
- [Expo Community](https://chat.expo.dev) - Discord community for help
- [Expo GitHub](https://github.com/expo/expo) - Open source platform
- [Report Issues](https://github.com/expo/expo/issues) - Bug reports and feature requests

---

**Project for Software Engineering Class**
Demonstrates modern mobile app development with authentication, database integration, interactive UI, and payment system architecture.
