/**
 * Reset sent transactions and recalculate balances based on received money only
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetSentTransactions() {
  console.log('\n🔄 Resetting Sent Transactions and Recalculating Balances\n');
  console.log('═'.repeat(80));

  try {
    // Get all users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, account_number');

    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }

    console.log(`\nFound ${users.length} users\n`);

    for (const user of users) {
      const userName = user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.email;

      console.log(`\n👤 ${userName} (${user.account_number})`);
      console.log('─'.repeat(80));

      // Delete all SENT transactions (debit/negative amounts)
      const { data: sentTxs, error: sentError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
        .eq('transaction_type', 'debit')
        .select();

      if (sentError) {
        console.log(`   ❌ Error deleting sent transactions: ${sentError.message}`);
        continue;
      }

      const sentCount = sentTxs ? sentTxs.length : 0;
      console.log(`   🗑️  Deleted ${sentCount} sent transactions`);

      // Get all RECEIVED transactions (credit/positive amounts)
      const { data: receivedTxs, error: receivedError } = await supabase
        .from('transactions')
        .select('id, title, amount, transaction_date')
        .eq('user_id', user.id)
        .eq('transaction_type', 'credit')
        .order('transaction_date', { ascending: true });

      if (receivedError) {
        console.log(`   ❌ Error fetching received transactions: ${receivedError.message}`);
        continue;
      }

      const receivedCount = receivedTxs ? receivedTxs.length : 0;
      console.log(`   💰 Found ${receivedCount} received transactions`);

      // Calculate total received
      const totalReceived = receivedTxs ? receivedTxs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) : 0;

      // New balance = Starting balance ($500) + Total received
      const newBalance = 500 + totalReceived;

      console.log(`   📊 Calculation:`);
      console.log(`      Starting balance: $500`);
      console.log(`      Total received: $${totalReceived.toFixed(2)}`);
      console.log(`      New balance: $${newBalance.toFixed(2)}`);

      // Update user balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) {
        console.log(`   ❌ Error updating balance: ${updateError.message}`);
      } else {
        console.log(`   ✅ Balance updated to $${newBalance.toFixed(2)}`);
      }

      // Show remaining transactions
      if (receivedTxs && receivedTxs.length > 0) {
        console.log(`\n   📝 Remaining transactions:`);
        receivedTxs.forEach((tx, index) => {
          console.log(`      ${index + 1}. ${tx.title} - $${tx.amount} (${tx.transaction_date})`);
        });
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Reset complete! All users now have:');
    console.log('   - No sent transactions');
    console.log('   - Balance = $500 + total received money');
    console.log('   - Transaction list shows only received payments\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
  }
}

resetSentTransactions();
