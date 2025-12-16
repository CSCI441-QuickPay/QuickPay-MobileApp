/**
 * Check what the recipient sees when receiving money
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Simulate TransactionModel.toTransaction
function toTransaction(dbTxn) {
  return {
    id: dbTxn.id,
    amount: Number(dbTxn.amount),
    transactionType: dbTxn.transaction_type,
    title: dbTxn.title,
    subtitle: dbTxn.subtitle,
    transactionDate: new Date(dbTxn.transaction_date),
  };
}

async function checkRecipientView() {
  console.log('\n📥 Checking Recipient View (What They See)\n');
  console.log('═'.repeat(80));

  try {
    // Get Seanglong Lim (recipient)
    const { data: recipient } = await supabase
      .from('users')
      .select('id, first_name, last_name, account_number, balance')
      .eq('account_number', '6131000239')
      .single();

    if (!recipient) {
      console.log('❌ Recipient not found');
      return;
    }

    console.log('\n👤 RECIPIENT: ' + recipient.first_name + ' ' + recipient.last_name);
    console.log('   Account: ' + recipient.account_number);
    console.log('   Balance: $' + recipient.balance);

    // Get recipient's credit transactions from Chanrattnak
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', recipient.id)
      .eq('transaction_type', 'credit')
      .ilike('subtitle', '%From: 5502494860%')
      .order('created_at', { ascending: false });

    console.log('\n📝 Money RECEIVED from Chanrattnak Mong: ' + (transactions ? transactions.length : 0));
    console.log('─'.repeat(80));

    if (transactions && transactions.length > 0) {
      transactions.forEach((dbTx, index) => {
        const tx = toTransaction(dbTx);
        const isIncome = tx.amount > 0;
        const color = isIncome ? 'GREEN' : 'RED';

        console.log('\n' + (index + 1) + '. ' + tx.title);
        console.log('   Amount: $' + tx.amount);
        console.log('   Type: ' + tx.transactionType.toUpperCase());
        console.log('   Subtitle: ' + tx.subtitle);
        console.log('   Date: ' + tx.transactionDate.toISOString().split('T')[0]);
        console.log('\n   Display Logic:');
        console.log('   • isIncome = (amount > 0): ' + isIncome);
        console.log('   • Color: ' + color);
        console.log('   • Display: ' + (isIncome ? '+' : '-') + '$' + Math.abs(tx.amount));
        console.log('   ✓ Correct? ' + (color === 'GREEN' ? 'YES ✓' : 'NO ❌'));
      });
    } else {
      console.log('\n   ❌ No credit transactions found');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ EXPECTED BEHAVIOR:');
    console.log('\n   SENDER (You - Chanrattnak):');
    console.log('   • Transaction Type: DEBIT');
    console.log('   • Amount: -$1 (negative)');
    console.log('   • Display: RED with "-$1.00"');
    console.log('\n   RECIPIENT (Seanglong):');
    console.log('   • Transaction Type: CREDIT');
    console.log('   • Amount: +$1 (positive)');
    console.log('   • Display: GREEN with "+$1.00"');

    console.log('\n💡 SUMMARY:');
    if (transactions && transactions.length > 0) {
      const allCorrect = transactions.every(dbTx => {
        const tx = toTransaction(dbTx);
        return tx.transactionType === 'credit' && tx.amount > 0;
      });

      if (allCorrect) {
        console.log('   ✅ YES! Recipient will see GREEN (receiving money from you)');
        console.log('   ✅ Transaction displays as income with positive amount');
      } else {
        console.log('   ❌ NO! Some transactions have incorrect amounts');
      }
    } else {
      console.log('   ⚠️  No transactions found for recipient');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRecipientView();
