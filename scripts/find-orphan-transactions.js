/**
 * Find transactions with name mismatches and check when they were created
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function findOrphanTransactions() {
  console.log('\n🔍 Finding Transactions with Name Mismatches\n');
  console.log('═'.repeat(80));

  try {
    // Get your account
    const { data: you } = await supabase
      .from('users')
      .select('id, first_name, last_name, account_number')
      .eq('email', 'mongchanrattnak@gmail.com')
      .single();

    console.log('\n👤 Checking transactions for: ' + you.first_name + ' ' + you.last_name);
    console.log('   Account: ' + you.account_number);

    // Get all credit transactions (money received)
    const { data: creditTxs } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', you.id)
      .eq('transaction_type', 'credit')
      .order('created_at', { ascending: false });

    console.log('\n📥 Credit Transactions (Money Received): ' + creditTxs.length);
    console.log('─'.repeat(80));

    let mismatches = [];

    for (const tx of creditTxs) {
      // Parse sender account from subtitle
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
            mismatches.push({
              tx,
              displayedName: tx.merchant_name,
              actualName: actualSenderName,
              accountNumber: senderAccountNumber,
              createdAt: tx.created_at
            });
          }
        }
      }
    }

    if (mismatches.length === 0) {
      console.log('\n✅ No name mismatches found! All transactions are correct.\n');
      return;
    }

    console.log('\n❌ Found ' + mismatches.length + ' transaction(s) with name mismatches:\n');

    mismatches.forEach((m, idx) => {
      console.log((idx + 1) + '. Transaction ID: ' + m.tx.id);
      console.log('   Title: ' + m.tx.title);
      console.log('   Amount: $' + m.tx.amount);
      console.log('   Created: ' + m.createdAt);
      console.log('   Displayed: "' + m.displayedName + '"');
      console.log('   Should be: "' + m.actualName + '"');
      console.log('   Account: ' + m.accountNumber + '\n');
    });

    console.log('═'.repeat(80));
    console.log('\n💡 CAUSE:');
    console.log('   These transactions were likely created with an old/buggy version');
    console.log('   of the process_payment function that stored the wrong name.');
    console.log('\n📋 SOLUTION:');
    console.log('   Option 1: Delete these specific transactions (they\'re orphaned)');
    console.log('   Option 2: Update merchant_name to correct name');
    console.log('   Option 3: Leave as-is (just display issue, balance is correct)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findOrphanTransactions();
