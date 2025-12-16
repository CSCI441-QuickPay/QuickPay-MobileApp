/**
 * Fix transactions with wrong merchant names
 * Updates merchant_name to match the actual account owner
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function fixReceivedTransactions() {
  console.log('\n🔧 Fixing Transactions with Wrong Names\n');
  console.log('═'.repeat(80));

  try {
    // Get your account
    const { data: you } = await supabase
      .from('users')
      .select('id, first_name, last_name, account_number')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    console.log('\n👤 Account: ' + you.first_name + ' ' + you.last_name);
    console.log('   Number: ' + you.account_number);

    // Get all credit transactions
    const { data: creditTxs } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', you.id)
      .eq('transaction_type', 'credit')
      .order('created_at', { ascending: false });

    console.log('\n📥 Checking ' + creditTxs.length + ' credit transaction(s)...\n');

    let fixed = 0;

    for (const tx of creditTxs) {
      const fromMatch = tx.subtitle.match(/From: (\d+)/);
      if (fromMatch) {
        const senderAccountNumber = fromMatch[1];

        const { data: sender } = await supabase
          .from('users')
          .select('first_name, last_name, account_number')
          .eq('account_number', senderAccountNumber)
          .single();

        if (sender) {
          const actualSenderName = sender.first_name + ' ' + sender.last_name;

          if (tx.merchant_name !== actualSenderName) {
            console.log('🔧 Fixing Transaction:');
            console.log('   ID: ' + tx.id);
            console.log('   Amount: $' + tx.amount);
            console.log('   Old Name: "' + tx.merchant_name + '"');
            console.log('   New Name: "' + actualSenderName + '"');
            console.log('   Account: ' + senderAccountNumber);

            // Update the transaction
            const { error: updateError } = await supabase
              .from('transactions')
              .update({
                merchant_name: actualSenderName,
                title: 'Received from ' + actualSenderName
              })
              .eq('id', tx.id);

            if (updateError) {
              console.log('   ❌ Error: ' + updateError.message);
            } else {
              console.log('   ✅ Fixed!\n');
              fixed++;
            }
          }
        }
      }
    }

    console.log('═'.repeat(80));
    console.log('\n💡 SUMMARY:');
    console.log('   Transactions checked: ' + creditTxs.length);
    console.log('   Transactions fixed: ' + fixed);

    if (fixed > 0) {
      console.log('\n✅ Successfully fixed all name mismatches!');
      console.log('   Transactions now show the correct sender names\n');
    } else {
      console.log('\n✅ No fixes needed - all transactions are correct!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixReceivedTransactions();
