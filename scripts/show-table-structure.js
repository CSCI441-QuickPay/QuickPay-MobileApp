/**
 * Show transactions table structure
 * Run with: node scripts/show-table-structure.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orptfearwcypftrjkoaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycHRmZWFyd2N5cGZ0cmprb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY2MjAsImV4cCI6MjA3NzQxMjYyMH0.KJK1E_KamDPyRoL383fd6h_fiuVTweacjomAW4RgDlA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function showTableStructure() {
  console.log('📊 Checking transactions table structure\n');

  try {
    // Insert a test record to see what columns are available
    const testRecord = {
      user_id: '00000000-0000-0000-0000-000000000000',
      amount: 10.00,
      transaction_type: 'debit',
      description: 'TEST - checking columns',
      transaction_date: new Date().toISOString().split('T')[0],
      pending: false,
      title: 'TEST TITLE',
      subtitle: 'TEST SUBTITLE'
    };

    console.log('Attempting to insert test record with title and subtitle...\n');

    const { data, error } = await supabase
      .from('transactions')
      .insert(testRecord)
      .select();

    if (error) {
      console.log('❌ Insert failed with error:');
      console.log('   ', error.message);
      console.log('\n' + '='.repeat(60));

      if (error.message.includes('title') || error.message.includes('subtitle')) {
        console.log('🔍 PROBLEM IDENTIFIED:');
        console.log('   The transactions table is MISSING title/subtitle columns!');
        console.log('\n📋 SOLUTION:');
        console.log('   Run this SQL in Supabase Dashboard → SQL Editor:\n');
        console.log('   ALTER TABLE transactions');
        console.log('   ADD COLUMN IF NOT EXISTS title TEXT,');
        console.log('   ADD COLUMN IF NOT EXISTS subtitle TEXT,');
        console.log('   ADD COLUMN IF NOT EXISTS icon TEXT,');
        console.log('   ADD COLUMN IF NOT EXISTS logo TEXT,');
        console.log('   ADD COLUMN IF NOT EXISTS split_data JSONB;');
        console.log('\n   Direct link: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/sql');
      }
    } else {
      console.log('✅ Insert succeeded! Columns exist.');
      console.log('   Inserted record:', data);

      // Clean up test record
      if (data && data[0]) {
        await supabase
          .from('transactions')
          .delete()
          .eq('id', data[0].id);
        console.log('   (Test record cleaned up)');
      }
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }

  console.log('\n✨ Done!\n');
}

showTableStructure().then(() => {
  process.exit(0);
});
