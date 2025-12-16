/**
 * Check transactions and verify names match account numbers
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTransactions() {
  console.log('\n💰 Checking Transactions for Name Mismatches\n');
  console.log('═'.repeat(80));

  try {
    // Get your account (main one)
    const { data: you, error: yourError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, account_number, balance')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    if (yourError) throw yourError;

    console.log('\n👤 YOUR ACCOUNT: ' + you.first_name + ' ' + you.last_name);
    console.log('   Email: ' + you.email);
    console.log('   Account: ' + you.account_number);
    console.log('   Balance: $' + you.balance);

    // Get your recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', you.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (txError) throw txError;

    console.log('\n📝 Recent Transactions: ' + transactions.length);
    console.log('─'.repeat(80));

    let nameMismatches = 0;

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      const isIncome = tx.amount > 0;
      const color = isIncome ? 'GREEN' : 'RED';

      console.log('\n' + (i + 1) + '. ' + tx.title);
      console.log('   Amount: $' + tx.amount + ' (' + color + ')');
      console.log('   Type: ' + tx.transaction_type.toUpperCase());
      console.log('   Merchant: ' + (tx.merchant_name || 'N/A'));
      console.log('   Subtitle: ' + (tx.subtitle || 'N/A'));

      // For received money (credit), check the sender
      if (tx.transaction_type === 'credit' && tx.subtitle && tx.subtitle.includes('From:')) {
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
            console.log('\n   🔍 RECEIVED FROM:');
            console.log('   • Displayed Name: "' + tx.merchant_name + '"');
            console.log('   • Account Number: ' + senderAccountNumber);
            console.log('   • Actual Owner: "' + actualSenderName + '"');

            if (tx.merchant_name !== actualSenderName) {
              console.log('   ❌ NAME MISMATCH!');
              nameMismatches++;
            } else {
              console.log('   ✓ Correct');
            }
          }
        }
      }

      // For sent money (debit), check the recipient
      if (tx.transaction_type === 'debit' && tx.subtitle && tx.subtitle.includes('To:')) {
        const toMatch = tx.subtitle.match(/To: (\d+)/);
        if (toMatch) {
          const recipientAccountNumber = toMatch[1];

          const { data: recipient } = await supabase
            .from('users')
            .select('first_name, last_name, account_number')
            .eq('account_number', recipientAccountNumber)
            .single();

          if (recipient) {
            const actualRecipientName = recipient.first_name + ' ' + recipient.last_name;
            console.log('\n   🔍 SENT TO:');
            console.log('   • Displayed Name: "' + tx.merchant_name + '"');
            console.log('   • Account Number: ' + recipientAccountNumber);
            console.log('   • Actual Owner: "' + actualRecipientName + '"');

            if (tx.merchant_name !== actualRecipientName) {
              console.log('   ❌ NAME MISMATCH!');
              nameMismatches++;
            } else {
              console.log('   ✓ Correct');
            }
          }
        }
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 SUMMARY:');
    console.log('   Total transactions: ' + transactions.length);
    console.log('   Name mismatches: ' + nameMismatches);

    if (nameMismatches > 0) {
      console.log('\n⚠️  ISSUE: Transactions showing wrong names');
      console.log('   Account numbers are correct, but merchant_name is wrong\n');
    } else {
      console.log('\n✅ All names are correct!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTransactions();
