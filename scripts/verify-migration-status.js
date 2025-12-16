/**
 * Verify if migrations have been applied
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyMigrationStatus() {
  console.log('\n🔍 Verifying Migration Status\n');
  console.log('═'.repeat(80));

  try {
    // Check if description column is nullable
    const { data: descriptionCheck, error: descError } = await supabase
      .from('transactions')
      .select('description')
      .limit(1);

    console.log('\n✓ Migration 008 (Optional Description):');
    console.log('   Status: Cannot verify via API (need admin access)');
    console.log('   Test: Try sending money without a note to verify');

    // Check for positive debit transactions
    const { data: positiveDebits, error: posError } = await supabase
      .from('transactions')
      .select('id, title, amount, transaction_type')
      .eq('transaction_type', 'debit')
      .gt('amount', 0);

    console.log('\n✓ Migration 009 (Fix Debit Amounts):');
    if (positiveDebits && positiveDebits.length > 0) {
      console.log('   Status: ❌ NOT APPLIED');
      console.log('   Found ' + positiveDebits.length + ' debit transactions with positive amounts:');
      positiveDebits.forEach((tx, index) => {
        console.log('     ' + (index + 1) + '. ' + tx.title + ' - Amount: $' + tx.amount);
      });
      console.log('\n   ⚠️  YOU NEED TO RUN THE MIGRATION!');
    } else {
      console.log('   Status: ✅ APPLIED');
      console.log('   All debit transactions have negative amounts');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n📋 TO APPLY MIGRATIONS:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/sql');
    console.log('   2. Click "+ New Query"');
    console.log('   3. Copy contents of: supabase/migrations/APPLY_ALL_FIXES.sql');
    console.log('   4. Paste and click "Run"\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyMigrationStatus();
