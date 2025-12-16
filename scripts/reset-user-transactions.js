/**
 * Transaction Reset Script
 *
 * Resets a user's transaction history and syncs bank balances with fresh Plaid data.
 *
 * Usage:
 *   node scripts/reset-user-transactions.js <clerk_id_or_email>
 *
 * Example:
 *   node scripts/reset-user-transactions.js user_2abc123xyz
 *   node scripts/reset-user-transactions.js user@example.com
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('   Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in .env');
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
 * Get transaction count for user
 */
async function getTransactionCount(userId) {
  const { count, error } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
}

/**
 * Get bank accounts for user
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
 * Call Supabase Edge Function to get fresh Plaid account data
 */
async function getPlaidAccounts(clerkId) {
  const response = await fetch(`${supabaseUrl}/functions/v1/plaid-get-accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ clerkId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch Plaid accounts');
  }

  return await response.json();
}

/**
 * Calculate total bank balance
 */
function sumBankBalances(bankAccounts) {
  return bankAccounts
    .filter(acc => acc.plaid_account_id) // Only Plaid accounts
    .reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
}

/**
 * Main reset function
 */
async function resetUserTransactions(identifier) {
  console.log('\n🔄 Transaction Reset Script\n');
  console.log('═'.repeat(60));
  console.log(`Looking up user: ${identifier}\n`);

  try {
    // 1. Get user from database
    const user = await getUser(identifier);
    console.log(`✅ Found user: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Clerk ID: ${user.clerk_id}`);
    console.log(`   User ID: ${user.id}\n`);

    // 2. Display BEFORE state
    console.log('📊 BEFORE STATE:');
    console.log('─'.repeat(60));

    const transactionCount = await getTransactionCount(user.id);
    console.log(`   QuickPay Balance (users.balance): $${parseFloat(user.balance || 0).toFixed(2)}`);
    console.log(`   Transactions count: ${transactionCount}`);

    const bankAccounts = await getBankAccounts(user.id);
    const plaidAccounts = bankAccounts.filter(acc => acc.plaid_account_id);
    console.log(`   Bank accounts (Plaid): ${plaidAccounts.length}`);

    if (plaidAccounts.length > 0) {
      plaidAccounts.forEach(acc => {
        console.log(`      - ${acc.account_name} (${acc.mask}): $${parseFloat(acc.balance || 0).toFixed(2)}`);
      });
    }

    const totalBankBalance = sumBankBalances(bankAccounts);
    const totalBalance = parseFloat(user.balance || 0) + totalBankBalance;
    console.log(`   Total Balance: $${totalBalance.toFixed(2)}\n`);

    // 3. Confirm with user
    console.log('⚠️  WARNING: This will:');
    console.log('   - Delete ALL transactions for this user');
    console.log('   - Reset QuickPay balance to $0');
    console.log('   - Sync bank_accounts with fresh Plaid data');
    console.log('   - Preserve Plaid connection\n');

    // Skip confirmation in non-interactive mode (when called programmatically)
    if (process.stdin.isTTY) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('Continue? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Operation cancelled by user\n');
        process.exit(0);
      }
    }

    console.log('\n🚀 Starting reset...\n');

    // 4. Delete all transactions
    console.log('   Deleting transactions...');
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) throw new Error(`Failed to delete transactions: ${deleteError.message}`);
    console.log('   ✅ Transactions deleted');

    // 5. Reset QuickPay balance to $0
    console.log('   Resetting QuickPay balance...');
    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: 0 })
      .eq('id', user.id);

    if (balanceError) throw new Error(`Failed to reset balance: ${balanceError.message}`);
    console.log('   ✅ QuickPay balance reset to $0');

    // 6. Sync bank_accounts with fresh Plaid data
    if (user.plaid_access_token && plaidAccounts.length > 0) {
      console.log('   Syncing bank accounts with Plaid...');

      try {
        const plaidData = await getPlaidAccounts(user.clerk_id);
        const freshAccounts = plaidData.accounts;

        let syncCount = 0;
        for (const plaidAccount of freshAccounts) {
          const { error: updateError } = await supabase
            .from('bank_accounts')
            .update({
              balance: plaidAccount.balances.current || 0,
              available_balance: plaidAccount.balances.available || 0,
            })
            .eq('plaid_account_id', plaidAccount.account_id)
            .eq('user_id', user.id);

          if (!updateError) {
            syncCount++;
          }
        }

        console.log(`   ✅ Synced ${syncCount} bank account(s) with Plaid`);
      } catch (plaidError) {
        console.log(`   ⚠️  Warning: Could not sync with Plaid: ${plaidError.message}`);
        console.log('   Bank account balances remain unchanged');
      }
    } else {
      console.log('   ℹ️  No Plaid accounts to sync');
    }

    // 7. Display AFTER state
    console.log('\n📊 AFTER STATE:');
    console.log('─'.repeat(60));

    const updatedUser = await getUser(user.clerk_id);
    const updatedBankAccounts = await getBankAccounts(user.id);
    const updatedPlaidAccounts = updatedBankAccounts.filter(acc => acc.plaid_account_id);
    const updatedTransactionCount = await getTransactionCount(user.id);

    console.log(`   QuickPay Balance (users.balance): $${parseFloat(updatedUser.balance || 0).toFixed(2)}`);
    console.log(`   Transactions count: ${updatedTransactionCount}`);
    console.log(`   Bank accounts (Plaid): ${updatedPlaidAccounts.length}`);

    if (updatedPlaidAccounts.length > 0) {
      updatedPlaidAccounts.forEach(acc => {
        console.log(`      - ${acc.account_name} (${acc.mask}): $${parseFloat(acc.balance || 0).toFixed(2)}`);
      });
    }

    const updatedTotalBankBalance = sumBankBalances(updatedBankAccounts);
    const updatedTotalBalance = parseFloat(updatedUser.balance || 0) + updatedTotalBankBalance;
    console.log(`   Total Balance: $${updatedTotalBalance.toFixed(2)}`);

    console.log('\n✅ Reset complete!');
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
  console.error('  node scripts/reset-user-transactions.js <clerk_id_or_email>');
  console.error('\nExample:');
  console.error('  node scripts/reset-user-transactions.js user_2abc123xyz');
  console.error('  node scripts/reset-user-transactions.js user@example.com\n');
  process.exit(1);
}

resetUserTransactions(identifier);
