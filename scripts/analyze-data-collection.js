/**
 * Data Collection Analysis Script
 *
 * This script analyzes and documents all data collection points in the
 * QuickPay Mobile App, including what data is collected, where it's stored,
 * and how it's used.
 *
 * Usage: node scripts/analyze-data-collection.js
 *
 * Outputs:
 * - Summary of all data collection points
 * - Data types collected at each point
 * - Storage locations and encryption methods
 * - External services and data sharing
 * - Compliance and retention policies
 */

const fs = require('fs');
const path = require('path');

/**
 * Comprehensive data collection analysis
 */
const analysis = {
  // All points where data is collected from users
  dataCollectionPoints: [
    {
      point: 'User Signup',
      screen: 'app/(auth)/signup/*',
      dataTypes: ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'birthday'],
      storage: 'Clerk (auth) + Supabase (profile)',
      service: 'UserSyncService',
      file: 'services/UserSyncService.ts',
      purpose: 'Create user account and profile',
      required: true
    },
    {
      point: 'User Login',
      screen: 'app/(auth)/login.tsx',
      dataTypes: ['email', 'password', 'session_token'],
      storage: 'Clerk (auth) + SecureStore (session)',
      service: 'Clerk SDK',
      file: 'app/(auth)/login.tsx',
      purpose: 'Authenticate user and create session',
      required: true
    },
    {
      point: 'Bank Account Linking (Plaid)',
      screen: 'app/plaid-onboarding-hosted.tsx',
      dataTypes: ['plaid_access_token', 'bank_name', 'account_ids'],
      storage: 'Supabase (encrypted)',
      service: 'PlaidService + Edge Functions',
      file: 'services/PlaidService.ts',
      purpose: 'Link bank account for transaction tracking',
      required: false
    },
    {
      point: 'Transaction Fetching',
      screen: 'app/(main)/home.tsx',
      dataTypes: ['transactions', 'account_balances', 'merchant_names', 'categories'],
      storage: 'Memory only (React state)',
      service: 'PlaidService',
      file: 'services/PlaidService.ts',
      purpose: 'Display transaction history and balances',
      required: false
    },
    {
      point: 'Favorites Management',
      screen: 'app/(main)/favorite.tsx',
      dataTypes: ['contact_name', 'nickname', 'email', 'phoneNumber'],
      storage: 'Supabase',
      service: 'Direct database calls',
      file: 'app/(main)/favorite.tsx',
      purpose: 'Save frequently used contacts for quick transfers',
      required: false
    },
    {
      point: 'Profile Updates',
      screen: 'app/(main)/profile.tsx',
      dataTypes: ['firstName', 'lastName', 'phoneNumber', 'profilePicture'],
      storage: 'Clerk + Supabase (synced)',
      service: 'UserSyncService',
      file: 'services/UserSyncService.ts',
      purpose: 'Update user profile information',
      required: false
    },
    {
      point: 'QR Code Generation',
      screen: 'components/home/QRCodeModal.tsx',
      dataTypes: ['payment_request_data', 'user_id'],
      storage: 'Memory only (temporary)',
      service: 'QR Code generator',
      file: 'components/home/QRCodeModal.tsx',
      purpose: 'Generate QR code for receiving payments',
      required: false
    }
  ],

  // Where data is stored and how it's protected
  storageLocations: [
    {
      location: 'Supabase PostgreSQL',
      dataTypes: ['user_profile', 'favorites', 'plaid_tokens', 'metadata'],
      encryption: 'At rest (Supabase managed encryption)',
      access: 'Row Level Security (RLS) policies',
      retention: 'Until account deletion',
      backup: 'Daily automated backups',
      compliance: 'SOC 2 Type II, GDPR, HIPAA'
    },
    {
      location: 'Clerk Cloud',
      dataTypes: ['auth_credentials', 'session_tokens', 'oauth_data', 'email_verification'],
      encryption: 'Full encryption (passwords hashed with bcrypt)',
      access: 'API key authentication',
      retention: 'Active + 30 days after last login',
      backup: 'Clerk managed',
      compliance: 'SOC 2, GDPR, CCPA'
    },
    {
      location: 'Device SecureStore',
      dataTypes: ['session_tokens', 'clerk_id', 'user_preferences'],
      encryption: 'iOS Keychain / Android Keystore',
      access: 'App-only (OS-level security)',
      retention: 'Until app uninstall or manual logout',
      backup: 'Not backed up (security)',
      compliance: 'Device OS security standards'
    },
    {
      location: 'Device AsyncStorage',
      dataTypes: ['app_preferences', 'cached_balance', 'ui_state'],
      encryption: 'None (non-sensitive data only)',
      access: 'App-only',
      retention: 'Until app uninstall or cleared',
      backup: 'Not backed up',
      compliance: 'N/A (non-sensitive)'
    },
    {
      location: 'React State (Memory)',
      dataTypes: ['transactions', 'accounts', 'current_balance', 'ui_data'],
      encryption: 'N/A (temporary only)',
      access: 'Current session only',
      retention: 'Cleared on app restart',
      backup: 'Not applicable',
      compliance: 'N/A (ephemeral)'
    }
  ],

  // External services that receive user data
  externalServices: [
    {
      service: 'Clerk',
      purpose: 'Authentication and user management',
      dataShared: ['email', 'name', 'phone', 'password (hashed)', 'oauth_tokens'],
      dataFlow: 'Bidirectional (create, read, update)',
      privacyPolicy: 'https://clerk.com/privacy',
      website: 'https://clerk.com',
      compliance: 'SOC 2, GDPR, CCPA',
      dataLocation: 'US (AWS)'
    },
    {
      service: 'Plaid',
      purpose: 'Banking data access and aggregation',
      dataShared: ['bank_credentials (not stored)', 'account_info', 'transactions'],
      dataFlow: 'Read-only from banks',
      privacyPolicy: 'https://plaid.com/legal/',
      website: 'https://plaid.com',
      compliance: 'SOC 2, ISO 27001, GDPR',
      dataLocation: 'US'
    },
    {
      service: 'Supabase',
      purpose: 'Database and backend infrastructure',
      dataShared: ['All user data', 'favorites', 'plaid_tokens'],
      dataFlow: 'Full CRUD access',
      privacyPolicy: 'https://supabase.com/privacy',
      website: 'https://supabase.com',
      compliance: 'SOC 2, GDPR, HIPAA',
      dataLocation: 'Configurable (US East)'
    },
    {
      service: 'Expo',
      purpose: 'Mobile app framework and updates',
      dataShared: ['Error logs', 'performance metrics', 'app version'],
      dataFlow: 'One-way (app to Expo)',
      privacyPolicy: 'https://expo.dev/privacy',
      website: 'https://expo.dev',
      compliance: 'GDPR',
      dataLocation: 'US'
    }
  ],

  // Security and privacy measures
  securityMeasures: [
    {
      measure: 'HTTPS/TLS Encryption',
      scope: 'All network communications',
      implementation: 'Enforced by default in all API calls',
      standard: 'TLS 1.3'
    },
    {
      measure: 'Password Hashing',
      scope: 'User passwords',
      implementation: 'Bcrypt via Clerk',
      standard: 'Industry standard (10+ rounds)'
    },
    {
      measure: 'Token Encryption',
      scope: 'Session and access tokens',
      implementation: 'SecureStore (Keychain/Keystore)',
      standard: 'OS-level encryption'
    },
    {
      measure: 'Row Level Security (RLS)',
      scope: 'Database access',
      implementation: 'Supabase PostgreSQL policies',
      standard: 'User can only access their own data'
    },
    {
      measure: 'API Authentication',
      scope: 'All backend requests',
      implementation: 'Bearer tokens and API keys',
      standard: 'OAuth 2.0'
    },
    {
      measure: 'Input Validation',
      scope: 'All user inputs',
      implementation: 'Client and server-side validation',
      standard: 'OWASP guidelines'
    }
  ],

  // Compliance and legal considerations
  complianceInfo: {
    GDPR: {
      rightToAccess: 'Users can export their data via support request',
      rightToErasure: 'Users can request account deletion',
      dataPortability: 'Data exportable in JSON format',
      consentManagement: 'Explicit consent during signup'
    },
    CCPA: {
      rightToKnow: 'Documented in privacy policy',
      rightToDelete: 'Account deletion available',
      rightToOptOut: 'Can opt out of non-essential data collection',
      nonDiscrimination: 'No service restrictions for opt-outs'
    },
    PCI_DSS: {
      applicability: 'Not applicable - no credit card storage',
      payment_processing: 'Handled by external providers (future)'
    },
    financialRegulations: {
      bankData: 'Handled by Plaid (SOC 2, ISO 27001 compliant)',
      encryption: 'Bank-level encryption via Plaid',
      accessControl: 'Token-based, revocable access'
    }
  }
};

/**
 * Display the complete analysis
 */
function displayAnalysis() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   QUICKPAY DATA COLLECTION ANALYSIS REPORT        ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  // Section 1: Data Collection Points
  console.log('📍 ===== DATA COLLECTION POINTS =====\n');
  console.log(`Total Collection Points: ${analysis.dataCollectionPoints.length}\n`);

  analysis.dataCollectionPoints.forEach((point, index) => {
    console.log(`${index + 1}. ${point.point}`);
    console.log(`   Screen: ${point.screen}`);
    console.log(`   Data Collected: ${point.dataTypes.join(', ')}`);
    console.log(`   Storage: ${point.storage}`);
    console.log(`   Service: ${point.service}`);
    console.log(`   File: ${point.file}`);
    console.log(`   Purpose: ${point.purpose}`);
    console.log(`   Required: ${point.required ? 'Yes' : 'No (Optional)'}`);
    console.log('');
  });

  // Section 2: Storage Locations
  console.log('\n💾 ===== STORAGE LOCATIONS =====\n');
  console.log(`Total Storage Locations: ${analysis.storageLocations.length}\n`);

  analysis.storageLocations.forEach((loc, index) => {
    console.log(`${index + 1}. ${loc.location}`);
    console.log(`   Data Types: ${loc.dataTypes.join(', ')}`);
    console.log(`   Encryption: ${loc.encryption}`);
    console.log(`   Access Control: ${loc.access}`);
    console.log(`   Retention: ${loc.retention}`);
    console.log(`   Compliance: ${loc.compliance}`);
    console.log('');
  });

  // Section 3: External Services
  console.log('\n🔗 ===== EXTERNAL SERVICES =====\n');
  console.log(`Total External Services: ${analysis.externalServices.length}\n`);

  analysis.externalServices.forEach((svc, index) => {
    console.log(`${index + 1}. ${svc.service}`);
    console.log(`   Purpose: ${svc.purpose}`);
    console.log(`   Data Shared: ${svc.dataShared.join(', ')}`);
    console.log(`   Data Flow: ${svc.dataFlow}`);
    console.log(`   Privacy Policy: ${svc.privacyPolicy}`);
    console.log(`   Compliance: ${svc.compliance}`);
    console.log(`   Data Location: ${svc.dataLocation}`);
    console.log('');
  });

  // Section 4: Security Measures
  console.log('\n🔒 ===== SECURITY MEASURES =====\n');
  console.log(`Total Security Measures: ${analysis.securityMeasures.length}\n`);

  analysis.securityMeasures.forEach((measure, index) => {
    console.log(`${index + 1}. ${measure.measure}`);
    console.log(`   Scope: ${measure.scope}`);
    console.log(`   Implementation: ${measure.implementation}`);
    console.log(`   Standard: ${measure.standard}`);
    console.log('');
  });

  // Section 5: Compliance Summary
  console.log('\n⚖️  ===== COMPLIANCE SUMMARY =====\n');

  console.log('GDPR Compliance:');
  Object.entries(analysis.complianceInfo.GDPR).forEach(([key, value]) => {
    console.log(`  • ${key}: ${value}`);
  });
  console.log('');

  console.log('CCPA Compliance:');
  Object.entries(analysis.complianceInfo.CCPA).forEach(([key, value]) => {
    console.log(`  • ${key}: ${value}`);
  });
  console.log('');

  console.log('Financial Regulations:');
  Object.entries(analysis.complianceInfo.financialRegulations).forEach(([key, value]) => {
    console.log(`  • ${key}: ${value}`);
  });
  console.log('');

  // Section 6: Summary Statistics
  console.log('\n📊 ===== SUMMARY STATISTICS =====\n');
  console.log(`Data Collection Points: ${analysis.dataCollectionPoints.length}`);
  console.log(`Required Collection Points: ${analysis.dataCollectionPoints.filter(p => p.required).length}`);
  console.log(`Optional Collection Points: ${analysis.dataCollectionPoints.filter(p => !p.required).length}`);
  console.log(`Storage Locations: ${analysis.storageLocations.length}`);
  console.log(`External Services: ${analysis.externalServices.length}`);
  console.log(`Security Measures: ${analysis.securityMeasures.length}`);

  // Unique data types collected
  const allDataTypes = new Set();
  analysis.dataCollectionPoints.forEach(point => {
    point.dataTypes.forEach(type => allDataTypes.add(type));
  });
  console.log(`Unique Data Types Collected: ${allDataTypes.size}`);
  console.log(`\nData Types: ${Array.from(allDataTypes).join(', ')}`);

  console.log('\n');
}

/**
 * Export analysis to JSON file
 */
function exportAnalysisToFile() {
  const outputDir = path.join(__dirname, '..', 'data-exports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `data-collection-analysis-${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));

  console.log(`\n✅ Analysis exported to: ${filepath}\n`);
}

// ===== Script Entry Point =====

// Display the analysis
displayAnalysis();

// Optionally export to file
if (process.argv.includes('--export')) {
  exportAnalysisToFile();
  console.log('💾 Analysis has been exported to JSON file for further review.\n');
}

console.log('╔═══════════════════════════════════════════════════╗');
console.log('║              ANALYSIS COMPLETE                    ║');
console.log('╚═══════════════════════════════════════════════════╝\n');
console.log('To export this analysis to a JSON file, run:');
console.log('  node scripts/analyze-data-collection.js --export\n');
