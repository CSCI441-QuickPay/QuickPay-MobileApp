/**
 * Verify all transactions are in the new format
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

async function verifyTransactionFormat() {
  console.log('\n📊 Transaction Format Verification\n');
  console.log('═'.repeat(60));

  try {
    // Check for any remaining old format transactions
    const { data: oldFormat, error: oldError } = await supabase
      .from('transactions')
      .select('id, title, subtitle')
      .or('title.ilike.%Bank Transfer to%,title.eq.Bank Transfer Received')
      .limit(5);

    if (oldError) throw oldError;

    if (oldFormat && oldFormat.length > 0) {
      console.log(`\n⚠️  Found ${oldFormat.length} transactions still in old format:`);
      oldFormat.forEach(tx => {
        console.log(`   - ${tx.title}`);
        console.log(`     Subtitle: ${tx.subtitle}\n`);
      });
    } else {
      console.log('\n✅ All transactions updated to new format!');
    }

    // Show sample of updated transactions
    const { data: samples, error: sampleError } = await supabase
      .from('transactions')
      .select('title, subtitle, category')
      .order('created_at', { ascending: false })
      .limit(5);

    if (sampleError) throw sampleError;

    console.log('\n📝 Sample of Recent Transactions:\n');
    samples?.forEach((tx, i) => {
      console.log(`${i + 1}. ${tx.title}`);
      console.log(`   Category: ${tx.category || 'N/A'}`);
      console.log(`   Subtitle: ${tx.subtitle || 'N/A'}\n`);
    });

    console.log('═'.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

verifyTransactionFormat();
