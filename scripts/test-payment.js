/**
 * Test full payment flow
 * Run with: node scripts/test-payment.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orptfearwcypftrjkoaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycHRmZWFyd2N5cGZ0cmprb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY2MjAsImV4cCI6MjA3NzQxMjYyMH0.KJK1E_KamDPyRoL383fd6h_fiuVTweacjomAW4RgDlA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPayment() {
  console.log('💸 Testing Payment Flow\n');

  try {
    // Get two users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, account_number, balance')
      .limit(2);

    if (userError || !users || users.length < 2) {
      console.log('❌ Need at least 2 users in database to test payments');
      return;
    }

    const sender = users[0];
    const recipient = users[1];

    console.log('👤 Sender:', sender.email);
    console.log('   Account:', sender.account_number);
    console.log('   Balance BEFORE:', sender.balance);
    console.log('');
    console.log('👤 Recipient:', recipient.email);
    console.log('   Account:', recipient.account_number);
    console.log('   Balance BEFORE:', recipient.balance);
    console.log('');

    // Test payment
    const paymentAmount = 5.00;
    console.log(`💰 Attempting to send $${paymentAmount} from ${sender.email} to ${recipient.account_number}...\n`);

    const { data, error } = await supabase.rpc('process_payment', {
      p_sender_id: sender.id,
      p_recipient_account_number: recipient.account_number,
      p_sources: [
        {
          id: 'quickpay',
          type: 'quickpay',
          amount: paymentAmount
        }
      ],
      p_total_amount: paymentAmount,
      p_description: 'Test payment from script'
    });

    if (error) {
      console.log('❌ Payment FAILED:');
      console.log('   Error:', error.message);
      console.log('   Details:', error);
      console.log('\n' + '='.repeat(70));
      console.log('🔍 Possible issues:');
      console.log('   1. RLS policies blocking the function');
      console.log('   2. process_payment function not deployed');
      console.log('   3. Insufficient balance');
      console.log('   4. Missing columns in transactions table');
      console.log('\n📋 Check:');
      console.log('   - Supabase Dashboard → Database → Functions');
      console.log('   - Verify process_payment exists');
      console.log('   - Check RLS policies on transactions table');
      console.log('='.repeat(70));
      return;
    }

    console.log('✅ Payment SUCCESS!');
    console.log('   Response:', JSON.stringify(data, null, 2));
    console.log('');

    // Check balances after
    const { data: updatedUsers } = await supabase
      .from('users')
      .select('id, email, balance')
      .in('id', [sender.id, recipient.id]);

    const updatedSender = updatedUsers.find(u => u.id === sender.id);
    const updatedRecipient = updatedUsers.find(u => u.id === recipient.id);

    console.log('📊 Balances AFTER:');
    console.log('   Sender:', updatedSender.balance, `(changed: $${updatedSender.balance - sender.balance})`);
    console.log('   Recipient:', updatedRecipient.balance, `(changed: $${updatedRecipient.balance - recipient.balance})`);
    console.log('');

    // Check if transaction was created
    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .or(`user_id.eq.${sender.id},user_id.eq.${recipient.id}`)
      .order('created_at', { ascending: false })
      .limit(2);

    console.log('📝 Recent Transactions:');
    if (txns && txns.length > 0) {
      txns.forEach(txn => {
        console.log(`   - ${txn.transaction_type.toUpperCase()}: $${txn.amount} - ${txn.title}`);
        console.log(`     User: ${txn.user_id === sender.id ? 'Sender' : 'Recipient'}`);
        console.log(`     Date: ${txn.transaction_date}`);
      });
    } else {
      console.log('   ⚠️  No transactions found!');
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('   Stack:', err.stack);
  }

  console.log('\n✨ Done!\n');
}

testPayment().then(() => {
  process.exit(0);
});
