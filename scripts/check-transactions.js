/**
 * Check transactions in database
 * Shows all transactions for a user
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

async function checkTransactions(identifier) {
  console.log('\n📊 Check Transactions\n');
  console.log('═'.repeat(60));

  try {
    const user = await getUser(identifier);
    console.log(`✅ User: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}\n`);

    // Get all transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    console.log(`📋 Found ${transactions.length} transaction(s) in database:\n`);

    if (transactions.length === 0) {
      console.log('   No transactions found in database.\n');
      console.log('   The 3 transactions you see are likely from:');
      console.log('   1. Mock transactions (data/transaction.tsx)');
      console.log('   2. Plaid transactions (fetched from API)');
      console.log('   3. Demo AsyncStorage transactions (@demo_transactions)\n');
      return;
    }

    transactions.forEach((tx, idx) => {
      console.log(`${idx + 1}. ${tx.title || tx.description}`);
      console.log(`   Amount: $${Math.abs(tx.amount)}`);
      console.log(`   Type: ${tx.transaction_type}`);
      console.log(`   Date: ${tx.transaction_date}`);
      console.log(`   Category: ${tx.category}`);
      console.log(`   Pending: ${tx.pending}`);
      console.log(`   ID: ${tx.id}\n`);
    });

    console.log('═'.repeat(60));
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
  console.error('  node scripts/check-transactions.js <clerk_id_or_email>\n');
  process.exit(1);
}

checkTransactions(identifier);
