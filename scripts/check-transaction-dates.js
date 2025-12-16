/**
 * Check transaction dates in database
 * Run with: node scripts/check-transaction-dates.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orptfearwcypftrjkoaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycHRmZWFyd2N5cGZ0cmprb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY2MjAsImV4cCI6MjA3NzQxMjYyMH0.KJK1E_KamDPyRoL383fd6h_fiuVTweacjomAW4RgDlA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTransactionDates() {
  console.log('📅 Checking transaction dates\n');

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, title, transaction_date, created_at, amount, transaction_type')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No transactions found in database');
      return;
    }

    console.log(`Found ${data.length} recent transactions:\n`);
    console.log('='.repeat(80));

    data.forEach((txn, index) => {
      console.log(`${index + 1}. ${txn.title}`);
      console.log(`   Amount: $${txn.amount} (${txn.transaction_type})`);
      console.log(`   transaction_date: ${txn.transaction_date}`);
      console.log(`   created_at: ${txn.created_at}`);
      console.log(`   Date parsing test:`, new Date(txn.transaction_date).toString());
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n📊 Analysis:');

    const invalidDates = data.filter(txn => {
      const date = new Date(txn.transaction_date);
      return isNaN(date.getTime());
    });

    if (invalidDates.length > 0) {
      console.log(`❌ Found ${invalidDates.length} transactions with INVALID dates!`);
      console.log('   These will show as "Invalid Date" in the app');
    } else {
      console.log('✅ All transaction dates are valid');
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }

  console.log('\n✨ Done!\n');
}

checkTransactionDates().then(() => {
  process.exit(0);
});
