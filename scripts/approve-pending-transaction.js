/**
 * Manually approve a pending transaction
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function approvePending(transactionId) {
  console.log('\n✅ Approving Pending Transaction\n');
  console.log('═'.repeat(60));

  try {
    // Get transaction details
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txError || !tx) {
      throw new Error('Transaction not found');
    }

    console.log('📋 Transaction Details:');
    console.log(`   ID: ${tx.id}`);
    console.log(`   Amount: $${Math.abs(tx.amount)}`);
    console.log(`   Pending: ${tx.pending}`);
    console.log(`   Title: ${tx.title}\n`);

    if (!tx.pending) {
      console.log('⚠️  Transaction is already approved\n');
      return;
    }

    // Get user to find recipient
    const { data: sender } = await supabase
      .from('users')
      .select('*')
      .eq('id', tx.user_id)
      .single();

    console.log(`   Sender: ${sender.first_name} ${sender.last_name}\n`);

    // Mark as not pending
    await supabase
      .from('transactions')
      .update({ pending: false })
      .eq('id', transactionId);

    console.log('✅ Transaction marked as approved\n');

    // Deduct from bank account if bank_account_id exists
    if (tx.bank_account_id) {
      console.log('💳 Deducting from bank account...');

      // Get current balance
      const { data: bankAccount } = await supabase
        .from('bank_accounts')
        .select('balance, available_balance')
        .eq('id', tx.bank_account_id)
        .single();

      if (bankAccount) {
        const newBalance = parseFloat(bankAccount.balance) - Math.abs(tx.amount);
        const newAvailable = parseFloat(bankAccount.available_balance || bankAccount.balance) - Math.abs(tx.amount);

        const { error: bankError } = await supabase
          .from('bank_accounts')
          .update({
            balance: newBalance,
            available_balance: newAvailable,
          })
          .eq('id', tx.bank_account_id);

        if (bankError) {
          console.error('❌ Error updating bank balance:', bankError);
        } else {
          console.log(`✅ Bank account balance updated: $${parseFloat(bankAccount.balance).toFixed(2)} → $${newBalance.toFixed(2)}\n`);
        }
      }
    }

    console.log('✅ Done!\n');
    console.log('═'.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

const txId = process.argv[2];

if (!txId) {
  console.error('\n❌ Error: Missing transaction ID');
  console.error('\nUsage:');
  console.error('  node scripts/approve-pending-transaction.js <transaction_id>\n');
  process.exit(1);
}

approvePending(txId);
