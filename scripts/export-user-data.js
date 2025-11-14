/**
 * Export User Data Script
 *
 * This script exports all data for a specific user for GDPR compliance,
 * debugging, or data analysis purposes.
 *
 * Usage: node scripts/export-user-data.js <clerkId>
 *
 * Exports:
 * - User profile information
 * - Favorite contacts
 * - Account linking status
 * - Metadata (creation date, last update)
 *
 * Output: JSON file with all user data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('Please ensure .env file contains:');
  console.error('  EXPO_PUBLIC_SUPABASE_URL');
  console.error('  EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Main function to export user data
 * @param {string} clerkId - The Clerk ID of the user to export
 */
async function exportUserData(clerkId) {
  console.log(`\n🔄 Starting data export for user: ${clerkId}\n`);

  try {
    // Step 1: Fetch user profile
    console.log('📋 Fetching user profile...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError.message);
      return;
    }

    if (!user) {
      console.error(`❌ No user found with Clerk ID: ${clerkId}`);
      return;
    }

    console.log(`✅ Found user: ${user.email}`);

    // Step 2: Fetch favorites
    console.log('📋 Fetching favorite contacts...');
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id);

    if (favError) {
      console.error('⚠️  Warning: Could not fetch favorites:', favError.message);
    } else {
      console.log(`✅ Found ${favorites?.length || 0} favorite contacts`);
    }

    // Step 3: Compile export data
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportedBy: 'QuickPay Data Export Script v1.0',
        clerkId: clerkId
      },
      user: {
        id: user.id,
        clerk_id: user.clerk_id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        birthday: user.birthday,
        profilePicture: user.profilePicture,
        balance: user.balance,
        isActive: user.isActive,
        verified: user.verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
        // Redact sensitive data
        plaid_access_token: user.plaid_access_token ? '[REDACTED - Token exists]' : null,
        hasPlaidLinked: !!user.plaid_access_token
      },
      favorites: (favorites || []).map(fav => ({
        id: fav.id,
        name: fav.name,
        nickname: fav.nickname,
        email: fav.email,
        phoneNumber: fav.phoneNumber,
        created_at: fav.created_at
      })),
      summary: {
        totalFavorites: favorites?.length || 0,
        accountAge: calculateAccountAge(user.created_at),
        plaidLinked: !!user.plaid_access_token,
        accountStatus: user.isActive ? 'Active' : 'Inactive',
        emailVerified: user.verified
      }
    };

    // Step 4: Write to file
    const outputDir = path.join(__dirname, '..', 'data-exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `user-data-${clerkId}-${Date.now()}.json`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    // Step 5: Display results
    console.log('\n✅ ===== EXPORT COMPLETE =====');
    console.log(`📁 File: ${filepath}`);
    console.log(`📊 Summary:`);
    console.log(`   - User Email: ${user.email}`);
    console.log(`   - Name: ${user.first_name} ${user.last_name}`);
    console.log(`   - Favorites: ${favorites?.length || 0}`);
    console.log(`   - Plaid Linked: ${!!user.plaid_access_token ? 'Yes' : 'No'}`);
    console.log(`   - Account Status: ${user.isActive ? 'Active' : 'Inactive'}`);
    console.log(`   - Account Age: ${calculateAccountAge(user.created_at)}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Unexpected error during export:', error.message);
    console.error(error.stack);
  }
}

/**
 * Calculate how long ago the account was created
 * @param {string} createdAt - ISO timestamp of account creation
 * @returns {string} Human-readable account age
 */
function calculateAccountAge(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Less than 1 day';
  if (diffDays === 1) return '1 day';
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}

// ===== Script Entry Point =====

// Parse command line arguments
const clerkId = process.argv[2];

if (!clerkId) {
  console.error('\n❌ Error: Clerk ID is required\n');
  console.error('Usage: node scripts/export-user-data.js <clerkId>\n');
  console.error('Example: node scripts/export-user-data.js clerk_2a...\n');
  process.exit(1);
}

// Run the export
exportUserData(clerkId);
