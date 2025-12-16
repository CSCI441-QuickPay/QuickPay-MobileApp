/**
 * Check database transactions for current user
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMyTransactions() {
  console.log('\n📊 Checking Database Transactions\n');
  console.log('═'.repeat(80));

  try {
    // Get Chanrattnak Mong's user
    const { data: user } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, balance, account_number')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n👤 User:', user.first_name, user.last_name);
    console.log('   Email:', user.email);
    console.log('   Account:', user.account_number);
    console.log('   Balance: $' + user.balance);

    // Get all transactions for this user
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id, title, amount, transaction_type, transaction_date, subtitle, merchant_name, pending')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    console.log('\n📝 Transactions in Database: ' + (transactions ? transactions.length : 0));
    console.log('─'.repeat(80));

    if (transactions && transactions.length > 0) {
      transactions.forEach((tx, index) => {
        const statusTag = tx.pending ? '[PENDING]' : '';
        console.log('\n' + (index + 1) + '. ' + tx.title + ' ' + statusTag);
        console.log('   Amount: $' + tx.amount + ' (' + tx.transaction_type.toUpperCase() + ')');
        console.log('   Date: ' + tx.transaction_date);
        console.log('   Subtitle: ' + (tx.subtitle || 'N/A'));
        console.log('   Merchant: ' + (tx.merchant_name || 'N/A'));
      });
    } else {
      console.log('\n   ✅ No transactions found (clean slate!)');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 These transactions should appear in your home screen transaction list\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMyTransactions();
