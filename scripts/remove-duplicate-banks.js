/**
 * Remove Duplicate Bank Accounts Script
 *
 * Removes duplicate bank_accounts entries based on plaid_account_id.
 * Keeps the most recent entry for each unique plaid_account_id.
 *
 * Usage:
 *   node scripts/remove-duplicate-banks.js <clerk_id_or_email>
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch user by Clerk ID or email
 */
async function getUser(identifier) {
  // Try by clerk_id first
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', identifier)
    .single();

  // If not found, try by email
  if (error && error.code === 'PGRST116') {
    const result = await supabase
      .from('users')
      .select('*')
      .eq('email', identifier)
      .single();

    user = result.data;
    error = result.error;
  }

  if (error) {
    throw new Error(`User not found: ${identifier}`);
  }

  return user;
}

/**
 * Get all bank accounts for user
 */
async function getBankAccounts(userId) {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Remove duplicate bank accounts
 */
async function removeDuplicateBanks(identifier) {
  console.log('\n🧹 Remove Duplicate Bank Accounts Script\n');
  console.log('═'.repeat(60));
  console.log(`Looking up user: ${identifier}\n`);

  try {
    // 1. Get user
    const user = await getUser(identifier);
    console.log(`✅ Found user: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   User ID: ${user.id}\n`);

    // 2. Get all bank accounts
    const allBankAccounts = await getBankAccounts(user.id);
    const plaidAccounts = allBankAccounts.filter(acc => acc.plaid_account_id);

    console.log('📊 BEFORE STATE:');
    console.log('─'.repeat(60));
    console.log(`   Total bank accounts: ${allBankAccounts.length}`);
    console.log(`   Plaid bank accounts: ${plaidAccounts.length}\n`);

    if (plaidAccounts.length > 0) {
      console.log('   Current Plaid accounts:');
      plaidAccounts.forEach((acc, idx) => {
        console.log(`   ${idx + 1}. ${acc.account_name} (${acc.mask})`);
        console.log(`      Balance: $${parseFloat(acc.balance || 0).toFixed(2)}`);
        console.log(`      Plaid ID: ${acc.plaid_account_id}`);
        console.log(`      Database ID: ${acc.id}`);
        console.log(`      Created: ${acc.created_at}\n`);
      });
    }

    // 3. Find duplicates by plaid_account_id
    const accountsByPlaidId = {};
    plaidAccounts.forEach(acc => {
      if (!accountsByPlaidId[acc.plaid_account_id]) {
        accountsByPlaidId[acc.plaid_account_id] = [];
      }
      accountsByPlaidId[acc.plaid_account_id].push(acc);
    });

    // 4. Identify duplicates to delete
    const toDelete = [];
    const toKeep = [];

    Object.entries(accountsByPlaidId).forEach(([plaidId, accounts]) => {
      if (accounts.length > 1) {
        // Sort by created_at descending (most recent first)
        accounts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Keep the most recent, delete the rest
        toKeep.push(accounts[0]);
        toDelete.push(...accounts.slice(1));

        console.log(`⚠️  Found ${accounts.length} duplicates for Plaid ID: ${plaidId}`);
        console.log(`   Keeping: ${accounts[0].account_name} (${accounts[0].id})`);
        console.log(`   Deleting: ${accounts.slice(1).map(a => a.id).join(', ')}\n`);
      } else {
        toKeep.push(accounts[0]);
      }
    });

    if (toDelete.length === 0) {
      console.log('✅ No duplicate bank accounts found!\n');
      return;
    }

    console.log(`\n📋 Summary:`);
    console.log(`   Unique Plaid accounts: ${Object.keys(accountsByPlaidId).length}`);
    console.log(`   Accounts to keep: ${toKeep.length}`);
    console.log(`   Duplicates to delete: ${toDelete.length}\n`);

    // 5. Confirm deletion
    if (process.stdin.isTTY) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('Delete duplicate bank accounts? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Operation cancelled by user\n');
        process.exit(0);
      }
    }

    console.log('\n🚀 Deleting duplicates...\n');

    // 6. Delete duplicates
    for (const account of toDelete) {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', account.id);

      if (error) {
        console.error(`   ❌ Failed to delete ${account.id}: ${error.message}`);
      } else {
        console.log(`   ✅ Deleted: ${account.account_name} (${account.id})`);
      }
    }

    // 7. Display AFTER state
    const updatedBankAccounts = await getBankAccounts(user.id);
    const updatedPlaidAccounts = updatedBankAccounts.filter(acc => acc.plaid_account_id);

    console.log('\n📊 AFTER STATE:');
    console.log('─'.repeat(60));
    console.log(`   Total bank accounts: ${updatedBankAccounts.length}`);
    console.log(`   Plaid bank accounts: ${updatedPlaidAccounts.length}\n`);

    if (updatedPlaidAccounts.length > 0) {
      console.log('   Remaining Plaid accounts:');
      updatedPlaidAccounts.forEach((acc, idx) => {
        console.log(`   ${idx + 1}. ${acc.account_name} (${acc.mask})`);
        console.log(`      Balance: $${parseFloat(acc.balance || 0).toFixed(2)}`);
        console.log(`      Plaid ID: ${acc.plaid_account_id}\n`);
      });
    }

    console.log('✅ Duplicate removal complete!');
    console.log('═'.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run script
const identifier = process.argv[2];

if (!identifier) {
  console.error('\n❌ Error: Missing user identifier');
  console.error('\nUsage:');
  console.error('  node scripts/remove-duplicate-banks.js <clerk_id_or_email>');
  console.error('\nExample:');
  console.error('  node scripts/remove-duplicate-banks.js user_2abc123xyz');
  console.error('  node scripts/remove-duplicate-banks.js user@example.com\n');
  process.exit(1);
}

removeDuplicateBanks(identifier);
