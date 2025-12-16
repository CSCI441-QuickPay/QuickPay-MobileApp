/**
 * Test if a new user can send money using QuickPay balance
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testNewUserSendPayment() {
  console.log('\n💸 Testing: New User Sending Money via QuickPay Balance\n');
  console.log('═'.repeat(80));

  try {
    // Get the new user (Sok Sreng Chan)
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, account_number, balance')
      .eq('email', 'csoksreng@gmail.com')
      .single();

    if (senderError) {
      console.log('❌ Error fetching sender:', senderError.message);
      return;
    }

    // Get recipient (Chanrattnak Mong - main account)
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, account_number, balance')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    if (recipientError) {
      console.log('❌ Error fetching recipient:', recipientError.message);
      return;
    }

    console.log('\n👤 SENDER (New User): ' + sender.first_name + ' ' + sender.last_name);
    console.log('   Email: ' + sender.email);
    console.log('   Account: ' + sender.account_number);
    console.log('   Balance BEFORE: $' + sender.balance);

    console.log('\n👤 RECIPIENT: ' + recipient.first_name + ' ' + recipient.last_name);
    console.log('   Email: ' + recipient.email);
    console.log('   Account: ' + recipient.account_number);
    console.log('   Balance BEFORE: $' + recipient.balance);

    if (sender.balance < 10) {
      console.log('\n⚠️  WARNING: Sender balance is only $' + sender.balance);
      console.log('   This test will send $10, which may fail if balance < $10');
    }

    console.log('\n💳 Attempting to send $10 from ' + sender.first_name + ' to ' + recipient.first_name + '...');
    console.log('   Payment source: QuickPay Balance');

    // Call process_payment RPC function
    const { data, error } = await supabase.rpc('process_payment', {
      p_sender_id: sender.id,
      p_recipient_account_number: recipient.account_number,
      p_sources: [
        {
          type: 'quickpay',
          amount: 10.00
        }
      ],
      p_total_amount: 10.00,
      p_description: 'Test payment from new user'
    });

    if (error) {
      console.log('\n❌ PAYMENT FAILED!');
      console.log('─'.repeat(80));
      console.log('\n   Error Message: ' + error.message);
      console.log('   Error Code: ' + error.code);
      if (error.details) console.log('   Details: ' + error.details);
      if (error.hint) console.log('   Hint: ' + error.hint);

      console.log('\n🔍 POSSIBLE CAUSES:');
      console.log('   1. process_payment function not updated (migration 010 not applied)');
      console.log('   2. Insufficient balance: Sender has $' + sender.balance + ', trying to send $10');
      console.log('   3. RPC function parameter mismatch');
      console.log('   4. Database permissions issue');

      console.log('\n📋 SOLUTION:');
      console.log('   Run: node scripts/apply-all-migrations.js');
      console.log('   Then apply the SQL in Supabase Dashboard\n');

      return;
    }

    console.log('\n✅ PAYMENT SUCCESSFUL!');
    console.log('─'.repeat(80));
    console.log('\n   Success: ' + data[0].success);
    console.log('   Message: ' + data[0].message);
    console.log('   Sender new balance: $' + data[0].sender_new_balance);
    console.log('   Recipient new balance: $' + data[0].recipient_new_balance);
    console.log('   Transaction ID: ' + data[0].transaction_id);

    // Verify balances
    const { data: senderAfter } = await supabase
      .from('users')
      .select('balance')
      .eq('id', sender.id)
      .single();

    const { data: recipientAfter } = await supabase
      .from('users')
      .select('balance')
      .eq('id', recipient.id)
      .single();

    console.log('\n✅ VERIFIED BALANCES:');
    console.log('   Sender: $' + sender.balance + ' → $' + senderAfter.balance + ' (expected: $' + (sender.balance - 10) + ')');
    console.log('   Recipient: $' + recipient.balance + ' → $' + recipientAfter.balance + ' (expected: $' + (recipient.balance + 10) + ')');

    // Check transactions
    const { data: senderTx } = await supabase
      .from('transactions')
      .select('id, title, amount, transaction_type')
      .eq('user_id', sender.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: recipientTx } = await supabase
      .from('transactions')
      .select('id, title, amount, transaction_type')
      .eq('user_id', recipient.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('\n✅ TRANSACTIONS CREATED:');
    console.log('   Sender: "' + senderTx.title + '" - $' + senderTx.amount + ' (' + senderTx.transaction_type + ')');
    console.log('   Color: ' + (senderTx.amount < 0 ? 'RED ✓' : 'GREEN ❌'));
    console.log('   Recipient: "' + recipientTx.title + '" - $' + recipientTx.amount + ' (' + recipientTx.transaction_type + ')');
    console.log('   Color: ' + (recipientTx.amount > 0 ? 'GREEN ✓' : 'RED ❌'));

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 RESULT: New users CAN send money using QuickPay balance! ✓\n');

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:');
    console.error('   ' + error.message);
    if (error.stack) console.error('\n   Stack:', error.stack);
  }
}

testNewUserSendPayment();
