/**
 * End-to-end payment flow test
 * Run with: node scripts/test-end-to-end-payment.js
 *
 * This tests the complete flow:
 * 1. Send payment
 * 2. Verify balance updates
 * 3. Verify transactions are created
 * 4. Verify dates are correct (not "Invalid Date")
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orptfearwcypftrjkoaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycHRmZWFyd2N5cGZ0cmprb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY2MjAsImV4cCI6MjA3NzQxMjYyMH0.KJK1E_KamDPyRoL383fd6h_fiuVTweacjomAW4RgDlA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEndToEndPayment() {
  console.log('🧪 End-to-End Payment Flow Test\n');
  console.log('='.repeat(80));

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

    console.log('📋 Test Setup:');
    console.log(`   Sender: ${sender.email} (Balance: $${sender.balance})`);
    console.log(`   Recipient: ${recipient.email} (Balance: $${recipient.balance})`);
    console.log('');

    // Ensure sender has sufficient balance
    if (sender.balance < 10) {
      console.log('⚙️  Adding balance to sender...');
      await supabase
        .from('users')
        .update({ balance: 200 })
        .eq('id', sender.id);
      console.log('   ✅ Added $200 to sender\n');
    }

    // Step 1: Send Payment
    console.log('📤 STEP 1: Sending payment...');
    const paymentAmount = 10.00;
    console.log(`   Amount: $${paymentAmount}`);
    console.log(`   From: ${sender.email}`);
    console.log(`   To: ${recipient.account_number}\n`);

    const { data: paymentResult, error: paymentError } = await supabase.rpc('process_payment', {
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
      p_description: 'End-to-end test payment'
    });

    if (paymentError) {
      console.log('❌ Payment FAILED:');
      console.log('   ', paymentError.message);
      return;
    }

    console.log('✅ Payment successful!');
    console.log(`   Transaction ID: ${paymentResult.transaction_id}\n`);

    // Step 2: Verify Balances
    console.log('💰 STEP 2: Verifying balances...');
    const { data: updatedUsers } = await supabase
      .from('users')
      .select('id, email, balance')
      .in('id', [sender.id, recipient.id]);

    const updatedSender = updatedUsers.find(u => u.id === sender.id);
    const updatedRecipient = updatedUsers.find(u => u.id === recipient.id);

    const senderChange = updatedSender.balance - sender.balance;
    const recipientChange = updatedRecipient.balance - recipient.balance;

    console.log(`   Sender: $${sender.balance} → $${updatedSender.balance} (${senderChange >= 0 ? '+' : ''}${senderChange})`);
    console.log(`   Recipient: $${recipient.balance} → $${updatedRecipient.balance} (${recipientChange >= 0 ? '+' : ''}${recipientChange})`);

    if (Math.abs(senderChange + paymentAmount) < 0.01 && Math.abs(recipientChange - paymentAmount) < 0.01) {
      console.log('   ✅ Balances updated correctly!\n');
    } else {
      console.log('   ❌ Balance mismatch!\n');
    }

    // Step 3: Verify Transactions
    console.log('📝 STEP 3: Verifying transactions...');
    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .or(`user_id.eq.${sender.id},user_id.eq.${recipient.id}`)
      .order('created_at', { ascending: false })
      .limit(2);

    if (!txns || txns.length === 0) {
      console.log('   ❌ No transactions found!\n');
      return;
    }

    console.log(`   Found ${txns.length} transaction(s):\n`);

    let allDatesValid = true;
    txns.forEach((txn, index) => {
      const isCredit = txn.transaction_type === 'credit';
      const user = isCredit ? 'Recipient' : 'Sender';

      console.log(`   ${index + 1}. ${txn.title}`);
      console.log(`      User: ${user}`);
      console.log(`      Type: ${txn.transaction_type.toUpperCase()}`);
      console.log(`      Amount: $${txn.amount}`);
      console.log(`      Date (raw): ${txn.transaction_date}`);

      // Test date parsing
      const date = new Date(txn.transaction_date);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      if (isNaN(date.getTime())) {
        console.log(`      Date (parsed): ❌ INVALID DATE`);
        allDatesValid = false;
      } else {
        console.log(`      Date (parsed): ✅ ${dateStr}`);
      }
      console.log('');
    });

    // Step 4: Final Report
    console.log('='.repeat(80));
    console.log('📊 TEST RESULTS:\n');

    const testsPassed = [];
    const testsFailed = [];

    // Check 1: Payment success
    if (paymentResult && paymentResult.success) {
      testsPassed.push('✅ Payment processed successfully');
    } else {
      testsFailed.push('❌ Payment failed');
    }

    // Check 2: Balances updated
    if (Math.abs(senderChange + paymentAmount) < 0.01 && Math.abs(recipientChange - paymentAmount) < 0.01) {
      testsPassed.push('✅ Balances updated correctly');
    } else {
      testsFailed.push('❌ Balance mismatch');
    }

    // Check 3: Transactions created
    if (txns && txns.length >= 2) {
      testsPassed.push('✅ Transactions created (debit + credit)');
    } else {
      testsFailed.push('❌ Missing transactions');
    }

    // Check 4: Dates valid
    if (allDatesValid) {
      testsPassed.push('✅ All transaction dates are valid');
    } else {
      testsFailed.push('❌ Some transaction dates are INVALID');
    }

    // Print results
    testsPassed.forEach(test => console.log(test));
    if (testsFailed.length > 0) {
      console.log('');
      testsFailed.forEach(test => console.log(test));
    }

    console.log('\n' + '='.repeat(80));
    if (testsFailed.length === 0) {
      console.log('🎉 ALL TESTS PASSED! Payment system is working correctly.\n');
    } else {
      console.log(`⚠️  ${testsFailed.length} test(s) failed. Check the issues above.\n`);
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('   Stack:', err.stack);
  }

  console.log('✨ Done!\n');
}

testEndToEndPayment().then(() => {
  process.exit(0);
});
