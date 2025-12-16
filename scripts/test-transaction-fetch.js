/**
 * Test what data TransactionModel.getByUserId returns
 * This simulates exactly what the app fetches
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Simulate TransactionModel.toTransaction
function toTransaction(dbTxn) {
  return {
    id: dbTxn.id,
    userId: dbTxn.user_id,
    bankAccountId: dbTxn.bank_account_id,
    plaidTransactionId: dbTxn.plaid_transaction_id,
    amount: Number(dbTxn.amount),
    transactionType: dbTxn.transaction_type,
    category: dbTxn.category,
    merchantName: dbTxn.merchant_name,
    description: dbTxn.description,
    transactionDate: new Date(dbTxn.transaction_date),
    pending: dbTxn.pending,
    title: dbTxn.title,
    subtitle: dbTxn.subtitle,
    icon: dbTxn.icon,
    logo: dbTxn.logo,
    splitData: dbTxn.split_data ? JSON.parse(dbTxn.split_data) : undefined,
    createdAt: new Date(dbTxn.created_at),
    updatedAt: new Date(dbTxn.updated_at),
  };
}

// Simulate TransactionModel.getByUserId
async function getByUserId(userId, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data.map(toTransaction);
}

async function testTransactionFetch() {
  console.log('\n🧪 Testing Transaction Fetch (Simulating App Behavior)\n');
  console.log('═'.repeat(80));

  try {
    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    console.log('\n👤 User:', user.first_name, user.last_name);
    console.log('   ID:', user.id);

    // Fetch transactions exactly as the app does
    console.log('\n📡 Fetching transactions via TransactionModel.getByUserId()...');
    const transactions = await getByUserId(user.id);

    console.log('\n📝 Fetched ' + transactions.length + ' transactions:');
    console.log('─'.repeat(80));

    transactions.forEach((tx, index) => {
      const isIncome = tx.amount > 0;
      const color = isIncome ? 'GREEN' : 'RED';

      console.log('\n' + (index + 1) + '. ' + tx.title);
      console.log('   amount (raw): ' + tx.amount);
      console.log('   amount (typeof): ' + typeof tx.amount);
      console.log('   transactionType: ' + tx.transactionType);
      console.log('   isIncome = (tx.amount > 0): ' + isIncome);
      console.log('   Color displayed: ' + color);
      console.log('   ✓ Correct? ' + (
        (tx.transactionType === 'debit' && color === 'RED') ||
        (tx.transactionType === 'credit' && color === 'GREEN')
          ? 'YES ✓' : 'NO ❌'
      ));
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 RESULT:');

    const incorrectTransactions = transactions.filter(tx => {
      const isIncome = tx.amount > 0;
      const color = isIncome ? 'GREEN' : 'RED';
      return (tx.transactionType === 'debit' && color !== 'RED') ||
             (tx.transactionType === 'credit' && color !== 'GREEN');
    });

    if (incorrectTransactions.length > 0) {
      console.log('   ❌ Found ' + incorrectTransactions.length + ' transactions with wrong colors');
      console.log('   This indicates the data in the database is still incorrect');
      console.log('\n   ACTION REQUIRED:');
      console.log('   Run: node scripts/apply-migrations.js');
      console.log('   Then apply the SQL in Supabase Dashboard');
    } else {
      console.log('   ✅ All transactions have correct amounts and will display correct colors');
      console.log('\n   If the app still shows wrong colors:');
      console.log('   1. Pull down to refresh the home screen');
      console.log('   2. Close and reopen the app');
      console.log('   3. Clear Metro cache: npx expo start --clear');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTransactionFetch();
