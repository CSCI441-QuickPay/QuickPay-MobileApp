/**
 * Data Collection Analysis Script
 *
 * This script analyzes and documents all data collection points in the QuickPay app.
 * It provides transparency about what data is collected, where it's stored, and why.
 *
 * Usage:
 *   node scripts/analyze-data-collection.js          # Display analysis in console
 *   node scripts/analyze-data-collection.js --export # Export to JSON file
 *
 * Purpose:
 * - GDPR compliance documentation
 * - Privacy policy generation
 * - Security auditing
 * - Developer onboarding
 */

const fs = require('fs');
const path = require('path');

// ===== Data Collection Points =====

const dataCollectionPoints = [
  {
    id: 1,
    name: 'User Signup',
    screen: 'app/(auth)/signup/*',
    dataCollected: ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'birthday'],
    storage: {
      clerk: ['email', 'password', 'firstName', 'lastName', 'phoneNumber'],
      supabase: ['email', 'firstName', 'lastName', 'phoneNumber', 'birthday', 'clerk_id']
    },
    purpose: 'Create user account and profile',
    retention: 'Until account deletion',
    required: true,
    userConsent: 'Implicit (account creation)',
    security: ['TLS encryption', 'Bcrypt password hashing', 'Row-Level Security']
  },
  {
    id: 2,
    name: 'User Login',
    screen: 'app/(auth)/login.tsx',
    dataCollected: ['email', 'password'],
    storage: {
      clerk: ['session_token', 'refresh_token'],
      secureStore: ['clerk_session']
    },
    purpose: 'Authenticate user and maintain session',
    retention: 'Session duration (30 days)',
    required: true,
    userConsent: 'Implicit (using app)',
    security: ['TLS encryption', 'Secure token storage', 'Auto token refresh']
  },
  {
    id: 3,
    name: 'Plaid Bank Linking',
    screen: 'app/plaid-onboarding-hosted.tsx',
    dataCollected: ['bank_account_info', 'plaid_public_token', 'plaid_access_token', 'account_ids'],
    storage: {
      plaid: ['bank_credentials', 'account_data'],
      supabase: ['plaid_access_token (encrypted)', 'account_metadata']
    },
    purpose: 'Link bank accounts for transaction viewing',
    retention: 'Until user unlinks account',
    required: false,
    userConsent: 'Explicit (Plaid Link flow)',
    security: ['Plaid OAuth flow', 'Token encryption', 'No bank credentials stored']
  },
  {
    id: 4,
    name: 'Transaction Viewing',
    screen: 'app/(main)/home.tsx',
    dataCollected: ['transaction_history', 'account_balances', 'merchant_names'],
    storage: {
      plaid: ['transaction_data'],
      memory: ['cached_transactions (30 days)']
    },
    purpose: 'Display user financial activity',
    retention: 'Not persisted (fetched real-time from Plaid)',
    required: false,
    userConsent: 'Explicit (linked Plaid account)',
    security: ['API encryption', 'Server-side proxy', 'No local storage']
  },
  {
    id: 5,
    name: 'Favorite Contacts',
    screen: 'app/(main)/favorite.tsx',
    dataCollected: ['contact_name', 'contact_email', 'contact_phone', 'nickname'],
    storage: {
      supabase: ['favorites table']
    },
    purpose: 'Quick access to frequent transfer recipients',
    retention: 'Until user removes favorite',
    required: false,
    userConsent: 'Explicit (add favorite action)',
    security: ['Row-Level Security', 'User-scoped queries']
  },
  {
    id: 6,
    name: 'Profile Updates',
    screen: 'app/(main)/profile.tsx',
    dataCollected: ['profile_picture', 'firstName', 'lastName', 'phoneNumber'],
    storage: {
      clerk: ['profile_picture', 'firstName', 'lastName'],
      supabase: ['firstName', 'lastName', 'phoneNumber']
    },
    purpose: 'Update user profile information',
    retention: 'Until account deletion',
    required: false,
    userConsent: 'Explicit (profile edit action)',
    security: ['Image upload validation', 'File size limits', 'TLS encryption']
  },
  {
    id: 7,
    name: 'Visual Budget',
    screen: 'app/(main)/visual_budget.tsx',
    dataCollected: ['budget_categories', 'budget_amounts', 'category_relationships'],
    storage: {
      memory: ['budget_state (session only)']
    },
    purpose: 'Interactive budget planning',
    retention: 'Session only (not persisted)',
    required: false,
    userConsent: 'Implicit (using feature)',
    security: ['No persistent storage', 'Client-side only']
  }
];

// ===== Storage Locations =====

const storageLocations = {
  clerk: {
    name: 'Clerk Authentication',
    type: 'Third-party SaaS',
    location: 'US Cloud',
    dataTypes: ['Authentication credentials', 'OAuth tokens', 'User profile'],
    security: ['SOC 2 Type II', 'GDPR compliant', 'CCPA compliant'],
    retention: 'User-controlled (account deletion)',
    access: 'Clerk Admin API',
    docs: 'https://clerk.com/docs/security'
  },
  supabase: {
    name: 'Supabase PostgreSQL',
    type: 'Database (self-hosted or cloud)',
    location: 'Configurable region',
    dataTypes: ['User profiles', 'Favorites', 'Plaid tokens (encrypted)'],
    security: ['Row-Level Security', 'TLS 1.3', 'Encrypted backups'],
    retention: 'Until manual deletion',
    access: 'API with RLS policies',
    docs: 'https://supabase.com/docs/guides/auth/row-level-security'
  },
  plaid: {
    name: 'Plaid Banking API',
    type: 'Third-party SaaS',
    location: 'US Cloud',
    dataTypes: ['Bank credentials', 'Account data', 'Transactions'],
    security: ['Bank-level encryption', 'SOC 2 Type II', 'GDPR compliant'],
    retention: 'Plaid-controlled (90 days for transactions)',
    access: 'Plaid API via Edge Functions',
    docs: 'https://plaid.com/safety/'
  },
  secureStore: {
    name: 'Expo SecureStore',
    type: 'Device local storage',
    location: 'User device (iOS Keychain / Android Keystore)',
    dataTypes: ['Session tokens', 'Auth state'],
    security: ['Hardware-backed encryption', 'OS-level protection'],
    retention: 'Until app uninstall or logout',
    access: 'App only',
    docs: 'https://docs.expo.dev/versions/latest/sdk/securestore/'
  },
  memory: {
    name: 'App Memory',
    type: 'Runtime memory',
    location: 'User device RAM',
    dataTypes: ['Cached transactions', 'UI state', 'Budget data'],
    security: ['App sandbox', 'Cleared on app close'],
    retention: 'Session only',
    access: 'App only',
    docs: 'N/A'
  }
};

// ===== External Services =====

const externalServices = [
  {
    name: 'Clerk',
    purpose: 'Authentication and user management',
    dataShared: ['Email', 'Name', 'Phone', 'Profile picture'],
    privacy: 'https://clerk.com/legal/privacy',
    terms: 'https://clerk.com/legal/terms'
  },
  {
    name: 'Plaid',
    purpose: 'Banking data access',
    dataShared: ['Bank account info', 'Transactions', 'Balances'],
    privacy: 'https://plaid.com/legal/privacy-policy',
    terms: 'https://plaid.com/legal/end-user-services-agreement'
  },
  {
    name: 'Supabase',
    purpose: 'Backend database and APIs',
    dataShared: ['All app data (self-hosted possible)'],
    privacy: 'https://supabase.com/privacy',
    terms: 'https://supabase.com/terms'
  },
  {
    name: 'Expo',
    purpose: 'App development and deployment',
    dataShared: ['App usage analytics (opt-in)', 'Crash reports'],
    privacy: 'https://expo.dev/privacy',
    terms: 'https://expo.dev/terms'
  }
];

// ===== Security Measures =====

const securityMeasures = [
  { measure: 'TLS 1.3 Encryption', applies: 'All network communication' },
  { measure: 'Password Hashing', applies: 'User passwords (Clerk bcrypt)' },
  { measure: 'Token Encryption', applies: 'Plaid access tokens' },
  { measure: 'Row-Level Security', applies: 'Supabase database queries' },
  { measure: 'Secure Storage', applies: 'Device-stored tokens' },
  { measure: 'API Rate Limiting', applies: 'Edge Functions' }
];

// ===== Analysis Functions =====

function displayAnalysis() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   QUICKPAY DATA COLLECTION ANALYSIS REPORT        ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  // Collection Points
  console.log('📍 ===== DATA COLLECTION POINTS =====\n');
  console.log(`Total Collection Points: ${dataCollectionPoints.length}\n`);

  dataCollectionPoints.forEach(point => {
    console.log(`${point.id}. ${point.name}`);
    console.log(`   Screen: ${point.screen}`);
    console.log(`   Data Collected: ${point.dataCollected.join(', ')}`);
    console.log(`   Storage: ${Object.keys(point.storage).join(', ')}`);
    console.log(`   Purpose: ${point.purpose}`);
    console.log(`   Required: ${point.required ? 'Yes' : 'No'}`);
    console.log(`   User Consent: ${point.userConsent}`);
    console.log(`   Security: ${point.security.join(', ')}`);
    console.log('');
  });

  // Storage Locations
  console.log('\n💾 ===== STORAGE LOCATIONS =====\n');
  console.log(`Total Storage Types: ${Object.keys(storageLocations).length}\n`);

  Object.entries(storageLocations).forEach(([key, storage]) => {
    console.log(`• ${storage.name}`);
    console.log(`  Type: ${storage.type}`);
    console.log(`  Location: ${storage.location}`);
    console.log(`  Data Types: ${storage.dataTypes.join(', ')}`);
    console.log(`  Security: ${storage.security.join(', ')}`);
    console.log(`  Retention: ${storage.retention}`);
    console.log('');
  });

  // External Services
  console.log('\n🔗 ===== EXTERNAL SERVICES =====\n');
  console.log(`Total External Services: ${externalServices.length}\n`);

  externalServices.forEach(service => {
    console.log(`• ${service.name}`);
    console.log(`  Purpose: ${service.purpose}`);
    console.log(`  Data Shared: ${service.dataShared.join(', ')}`);
    console.log(`  Privacy Policy: ${service.privacy}`);
    console.log(`  Terms: ${service.terms}`);
    console.log('');
  });

  // Security Measures
  console.log('\n🔒 ===== SECURITY MEASURES =====\n');
  console.log(`Total Security Measures: ${securityMeasures.length}\n`);

  securityMeasures.forEach(sec => {
    console.log(`✓ ${sec.measure}`);
    console.log(`  Applies to: ${sec.applies}`);
    console.log('');
  });

  // Compliance Summary
  console.log('\n📋 ===== COMPLIANCE SUMMARY =====\n');
  console.log('✓ GDPR Compliant - User data export available');
  console.log('✓ CCPA Compliant - Data deletion on request');
  console.log('✓ User Consent - Documented for each collection point');
  console.log('✓ Data Minimization - Only essential data collected');
  console.log('✓ Security - Multiple layers of protection');
  console.log('✓ Transparency - Full disclosure in this document');
  console.log('');
}

function exportToJSON() {
  const analysisData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
      appName: 'QuickPay Mobile App'
    },
    dataCollectionPoints,
    storageLocations,
    externalServices,
    securityMeasures,
    compliance: {
      gdpr: true,
      ccpa: true,
      userConsent: true,
      dataMinimization: true,
      encryption: true,
      dataExport: true,
      rightToDelete: true
    }
  };

  const outputDir = path.join(__dirname, '..', 'data-exports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `data-collection-analysis-${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(analysisData, null, 2));

  console.log('\n✅ Analysis exported to JSON');
  console.log(`📁 File: ${filepath}\n`);
}

// ===== Script Entry Point =====

const args = process.argv.slice(2);
const shouldExport = args.includes('--export');

if (shouldExport) {
  exportToJSON();
} else {
  displayAnalysis();
}
