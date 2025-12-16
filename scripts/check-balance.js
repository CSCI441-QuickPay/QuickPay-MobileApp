/**
 * Check user and bank account balances
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

async function getUser(identifier) {
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', identifier)
    .single();

  if (error && error.code === 'PGRST116') {
    const result = await supabase
      .from('users')
      .select('*')
      .eq('email', identifier)
      .single();
    user = result.data;
    error = result.error;
  }

  if (error) throw new Error(`User not found: ${identifier}`);
  return user;
}

async function checkBalance(identifier) {
  console.log('\n💰 Check Balance\n');
  console.log('═'.repeat(60));

  try {
    const user = await getUser(identifier);
    console.log(`✅ User: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}\n`);

    // QuickPay Balance
    console.log('📊 QuickPay Balance (users.balance):');
    console.log(`   $${parseFloat(user.balance || 0).toFixed(2)}\n`);

    // Bank Accounts
    const { data: bankAccounts, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const plaidAccounts = bankAccounts.filter(acc => acc.plaid_account_id);

    console.log(`🏦 Bank Accounts (${plaidAccounts.length}):`);
    if (plaidAccounts.length > 0) {
      plaidAccounts.forEach((acc, idx) => {
        console.log(`   ${idx + 1}. ${acc.account_name} (${acc.mask})`);
        console.log(`      Balance: $${parseFloat(acc.balance || 0).toFixed(2)}`);
        console.log(`      Available: $${parseFloat(acc.available_balance || 0).toFixed(2)}`);
        console.log(`      Plaid ID: ${acc.plaid_account_id}\n`);
      });
    } else {
      console.log('   No bank accounts found\n');
    }

    // Total
    const plaidTotal = plaidAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
    const total = parseFloat(user.balance || 0) + plaidTotal;

    console.log('💵 Total Balance:');
    console.log(`   QuickPay: $${parseFloat(user.balance || 0).toFixed(2)}`);
    console.log(`   Banks: $${plaidTotal.toFixed(2)}`);
    console.log(`   Total: $${total.toFixed(2)}`);

    console.log('\n═'.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

const identifier = process.argv[2];

if (!identifier) {
  console.error('\n❌ Error: Missing user identifier');
  console.error('\nUsage:');
  console.error('  node scripts/check-balance.js <clerk_id_or_email>\n');
  process.exit(1);
}

checkBalance(identifier);
