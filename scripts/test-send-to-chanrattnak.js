/**
 * Test sending money TO Chanrattnak Mong from another user
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testSendToChangrattnak() {
  console.log('\n💸 Testing: Send Money TO Chanrattnak Mong\n');
  console.log('═'.repeat(80));

  try {
    // Get sender (Seanglong Lim)
    const { data: sender } = await supabase
      .from('users')
      .select('id, first_name, last_name, account_number, balance')
      .eq('account_number', '6131000239')
      .single();

    // Get recipient (Chanrattnak Mong)
    const { data: recipient } = await supabase
      .from('users')
      .select('id, first_name, last_name, account_number, balance')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    if (!sender || !recipient) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n👤 SENDER: ' + sender.first_name + ' ' + sender.last_name);
    console.log('   Account: ' + sender.account_number);
    console.log('   Balance BEFORE: $' + sender.balance);

    console.log('\n👤 RECIPIENT: ' + recipient.first_name + ' ' + recipient.last_name);
    console.log('   Account: ' + recipient.account_number);
    console.log('   Balance BEFORE: $' + recipient.balance);

    console.log('\n💳 Attempting to send $5 from ' + sender.first_name + ' to ' + recipient.first_name + '...');

    // Call process_payment RPC function
    const { data, error } = await supabase.rpc('process_payment', {
      p_sender_id: sender.id,
      p_recipient_account_number: recipient.account_number,
      p_total_amount: 5.00,
      p_description: 'Test payment from script',
      p_sources: [
        {
          type: 'quickpay',
          amount: 5.00
        }
      ]
    });

    if (error) {
      console.log('\n❌ ERROR:');
      console.log('   Message: ' + error.message);
      console.log('   Code: ' + error.code);
      console.log('   Details: ' + JSON.stringify(error.details));
      console.log('   Hint: ' + error.hint);

      console.log('\n🔍 POSSIBLE CAUSES:');
      console.log('   1. Insufficient balance (sender has $' + sender.balance + ', trying to send $5)');
      console.log('   2. RPC function not found or not updated');
      console.log('   3. Invalid account number');
      console.log('   4. Database permissions issue');

      return;
    }

    console.log('\n✅ PAYMENT SUCCESSFUL!');
    console.log('─'.repeat(80));
    console.log('\n   Success: ' + data[0].success);
    console.log('   Message: ' + data[0].message);
    console.log('   Sender new balance: $' + data[0].sender_new_balance);
    console.log('   Recipient new balance: $' + data[0].recipient_new_balance);
    console.log('   Transaction ID: ' + data[0].transaction_id);

    // Verify balances in database
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
    console.log('   Sender: $' + sender.balance + ' → $' + senderAfter.balance + ' (expected: $' + (sender.balance - 5) + ')');
    console.log('   Recipient: $' + recipient.balance + ' → $' + recipientAfter.balance + ' (expected: $' + (recipient.balance + 5) + ')');

    // Check transactions created
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
    console.log('   Should be RED? ' + (senderTx.amount < 0 ? 'YES ✓' : 'NO ❌'));
    console.log('   Recipient: "' + recipientTx.title + '" - $' + recipientTx.amount + ' (' + recipientTx.transaction_type + ')');
    console.log('   Should be GREEN? ' + (recipientTx.amount > 0 ? 'YES ✓' : 'NO ❌'));

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 RESULT: Other users CAN send money to you! ✓\n');

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:');
    console.error('   ' + error.message);
    console.error(error);
  }
}

testSendToChangrattnak();
