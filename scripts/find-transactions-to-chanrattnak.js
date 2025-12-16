/**
 * Find all transactions sent TO Chanrattnak Mong
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function findTransactionsToChangrattnak() {
  console.log('\n🔍 Finding Transactions Sent TO Chanrattnak Mong\n');
  console.log('═'.repeat(80));

  try {
    // Get Chanrattnak's account number
    const { data: chanrattnak } = await supabase
      .from('users')
      .select('id, first_name, last_name, account_number, balance')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    if (!chanrattnak) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n👤 Target User:', chanrattnak.first_name, chanrattnak.last_name);
    console.log('   Account:', chanrattnak.account_number);
    console.log('   Balance: $' + chanrattnak.balance);

    // Find all transactions where subtitle contains "To: {chanrattnak's account}"
    const toPattern = `To: ${chanrattnak.account_number}`;

    const { data: transactions } = await supabase
      .from('transactions')
      .select('id, user_id, title, amount, transaction_type, transaction_date, subtitle, merchant_name')
      .ilike('subtitle', `%${toPattern}%`)
      .order('transaction_date', { ascending: false });

    console.log('\n📝 Transactions with "To: ' + chanrattnak.account_number + '": ' + (transactions ? transactions.length : 0));
    console.log('─'.repeat(80));

    if (transactions && transactions.length > 0) {
      for (const tx of transactions) {
        // Get the sender's info
        const { data: sender } = await supabase
          .from('users')
          .select('first_name, last_name, account_number')
          .eq('id', tx.user_id)
          .single();

        console.log('\n• Transaction ID:', tx.id);
        console.log('  Amount: $' + tx.amount + ' (' + tx.transaction_type.toUpperCase() + ')');
        console.log('  Date: ' + tx.transaction_date);
        console.log('  Title: ' + tx.title);
        console.log('  Subtitle: ' + tx.subtitle);
        console.log('  Sender: ' + (sender ? `${sender.first_name} ${sender.last_name} (${sender.account_number})` : 'Unknown'));
        console.log('  Associated with user_id:', tx.user_id);
        console.log('  Should this be a CREDIT transaction for Chanrattnak? ' + (tx.user_id === chanrattnak.id ? 'YES' : 'NO - belongs to sender'));
      }
    } else {
      console.log('\n   ❌ No transactions found sent TO Chanrattnak');
    }

    // Also check for credit transactions in Chanrattnak's records
    console.log('\n\n🔍 Direct Credit Transactions for Chanrattnak:');
    console.log('─'.repeat(80));

    const { data: credits } = await supabase
      .from('transactions')
      .select('id, title, amount, transaction_type, transaction_date, subtitle, merchant_name')
      .eq('user_id', chanrattnak.id)
      .eq('transaction_type', 'credit')
      .order('transaction_date', { ascending: false });

    console.log('\n📝 Credit transactions: ' + (credits ? credits.length : 0));

    if (credits && credits.length > 0) {
      credits.forEach((tx, index) => {
        console.log('\n' + (index + 1) + '. ' + tx.title);
        console.log('   Amount: $' + tx.amount);
        console.log('   Date: ' + tx.transaction_date);
        console.log('   Subtitle: ' + (tx.subtitle || 'N/A'));
      });
    } else {
      console.log('\n   ❌ No credit transactions found for Chanrattnak');
      console.log('   🤔 This explains why balance is $519 but no received transactions show up!');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 DIAGNOSIS:');
    console.log('   • Balance: $519 (expected $500 + received)');
    console.log('   • Missing: $19 worth of credit transactions');
    console.log('   • Likely cause: Payment processing bug creating debit but not credit\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findTransactionsToChangrattnak();
