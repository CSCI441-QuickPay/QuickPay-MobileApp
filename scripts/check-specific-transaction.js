/**
 * Check specific transaction details
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSpecificTransaction() {
  console.log('\n🔍 Checking Specific Transaction Details\n');
  console.log('═'.repeat(80));

  try {
    // Get Chanrattnak's user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    // Get ALL transactions with raw data
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id, title, amount, transaction_type, subtitle, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('\n📝 ALL Transactions (Raw Data):');
    console.log('─'.repeat(80));

    transactions.forEach((tx, index) => {
      console.log('\n' + (index + 1) + '. ' + tx.title);
      console.log('   ID: ' + tx.id);
      console.log('   Amount (raw): ' + tx.amount);
      console.log('   Amount (type): ' + typeof tx.amount);
      console.log('   Type: ' + tx.transaction_type);
      console.log('   Subtitle: ' + tx.subtitle);
      console.log('   Created: ' + tx.created_at);
      console.log('   Should be RED? ' + (tx.transaction_type === 'debit' ? 'YES' : 'NO'));
      console.log('   Will show RED? ' + (tx.amount < 0 ? 'YES ✓' : 'NO ❌'));
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 DIAGNOSIS:');

    const positiveDebits = transactions.filter(tx => tx.transaction_type === 'debit' && tx.amount > 0);
    if (positiveDebits.length > 0) {
      console.log('   ❌ Found ' + positiveDebits.length + ' debit transaction(s) with positive amounts');
      console.log('   This is why they show GREEN instead of RED');
      console.log('\n   SOLUTION: The migration needs to be run in Supabase Dashboard');
    } else {
      console.log('   ✅ All debit transactions have negative amounts');
      console.log('   The issue might be in the frontend display logic');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkSpecificTransaction();
