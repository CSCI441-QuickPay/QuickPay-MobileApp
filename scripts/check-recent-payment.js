/**
 * Check the most recent payment transaction
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRecentPayment() {
  console.log('\n💳 Checking Recent Payment Transaction\n');
  console.log('═'.repeat(80));

  try {
    // Get Chanrattnak's user
    const { data: sender } = await supabase
      .from('users')
      .select('id, first_name, last_name, account_number, balance')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    if (!sender) {
      console.log('❌ Sender not found');
      return;
    }

    console.log('\n👤 SENDER (You):', sender.first_name, sender.last_name);
    console.log('   Account:', sender.account_number);
    console.log('   Balance: $' + sender.balance);

    // Get sender's most recent transaction
    const { data: senderTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', sender.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!senderTx) {
      console.log('❌ No transactions found for sender');
      return;
    }

    console.log('\n📤 YOUR TRANSACTION (Sender):');
    console.log('   Title:', senderTx.title);
    console.log('   Amount: $' + senderTx.amount);
    console.log('   Type:', senderTx.transaction_type.toUpperCase());
    console.log('   Subtitle:', senderTx.subtitle);
    console.log('   Date:', senderTx.transaction_date);
    console.log('   Created:', senderTx.created_at);

    // Parse the recipient account number from subtitle
    const toMatch = senderTx.subtitle.match(/To: (\d+)/);
    if (!toMatch) {
      console.log('❌ Could not parse recipient account number');
      return;
    }

    const recipientAccountNumber = toMatch[1];

    // Get recipient's info
    const { data: recipient } = await supabase
      .from('users')
      .select('id, first_name, last_name, account_number, balance')
      .eq('account_number', recipientAccountNumber)
      .single();

    if (!recipient) {
      console.log('❌ Recipient not found');
      return;
    }

    console.log('\n👤 RECIPIENT:', recipient.first_name, recipient.last_name);
    console.log('   Account:', recipient.account_number);
    console.log('   Balance: $' + recipient.balance);

    // Get recipient's matching transaction (same amount, opposite type, similar timestamp)
    const { data: recipientTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', recipient.id)
      .eq('transaction_type', 'credit')
      .ilike('subtitle', `%From: ${sender.account_number}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recipientTx) {
      console.log('\n📥 RECIPIENT\'S TRANSACTION:');
      console.log('   Title:', recipientTx.title);
      console.log('   Amount: $' + recipientTx.amount);
      console.log('   Type:', recipientTx.transaction_type.toUpperCase());
      console.log('   Subtitle:', recipientTx.subtitle);
      console.log('   Date:', recipientTx.transaction_date);
      console.log('   Created:', recipientTx.created_at);
    } else {
      console.log('\n❌ No matching credit transaction found for recipient');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ EXPECTED BEHAVIOR:');
    console.log('   Sender (You):');
    console.log('     • Type: DEBIT');
    console.log('     • Amount: NEGATIVE (e.g., -5)');
    console.log('     • Display: RED');
    console.log('   Recipient:');
    console.log('     • Type: CREDIT');
    console.log('     • Amount: POSITIVE (e.g., 5)');
    console.log('     • Display: GREEN');

    console.log('\n❓ ACTUAL BEHAVIOR:');
    console.log('   Sender (You):');
    console.log('     • Type: ' + senderTx.transaction_type.toUpperCase());
    console.log('     • Amount: ' + (senderTx.amount >= 0 ? 'POSITIVE ❌' : 'NEGATIVE ✓') + ' ($' + senderTx.amount + ')');
    console.log('     • Display: ' + (senderTx.amount >= 0 ? 'GREEN ❌ (should be RED)' : 'RED ✓'));

    if (recipientTx) {
      console.log('   Recipient:');
      console.log('     • Type: ' + recipientTx.transaction_type.toUpperCase());
      console.log('     • Amount: ' + (recipientTx.amount >= 0 ? 'POSITIVE ✓' : 'NEGATIVE ❌') + ' ($' + recipientTx.amount + ')');
      console.log('     • Display: ' + (recipientTx.amount >= 0 ? 'GREEN ✓' : 'RED ❌ (should be GREEN)'));
    }

    console.log('\n💡 TO FIX:');
    if (senderTx.amount >= 0) {
      console.log('   Run the SQL migration in Supabase Dashboard:');
      console.log('   File: supabase/migrations/APPLY_ALL_FIXES.sql\n');
    } else {
      console.log('   Transactions are already correct! ✓\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRecentPayment();
