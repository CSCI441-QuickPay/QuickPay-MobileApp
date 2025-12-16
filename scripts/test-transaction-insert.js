/**
 * Test transaction insert with real user
 * Run with: node scripts/test-transaction-insert.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orptfearwcypftrjkoaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycHRmZWFyd2N5cGZ0cmprb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY2MjAsImV4cCI6MjA3NzQxMjYyMH0.KJK1E_KamDPyRoL383fd6h_fiuVTweacjomAW4RgDlA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTransactionInsert() {
  console.log('🧪 Testing transaction insert\n');

  try {
    // Get first user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.email}`);
    console.log(`   ID: ${user.id}\n`);

    // Try to insert transaction with title and subtitle
    const testRecord = {
      user_id: user.id,
      amount: 10.00,
      transaction_type: 'debit',
      description: 'TEST - checking columns',
      transaction_date: new Date().toISOString().split('T')[0],
      pending: false,
      title: 'TEST TITLE',
      subtitle: 'TEST SUBTITLE'
    };

    console.log('Inserting test transaction with title and subtitle...\n');

    const { data, error } = await supabase
      .from('transactions')
      .insert(testRecord)
      .select();

    if (error) {
      console.log('❌ Insert FAILED:');
      console.log('   ', error.message);
      console.log('\n' + '='.repeat(70));

      if (error.message.includes('title') || error.message.includes('subtitle') || error.message.includes('column')) {
        console.log('🔍 PROBLEM: Missing columns in transactions table!');
        console.log('\n📋 FIX: Copy and run this SQL in Supabase Dashboard:\n');
        console.log('────────────────────────────────────────────────────────────────────');
        console.log('ALTER TABLE transactions');
        console.log('ADD COLUMN IF NOT EXISTS title TEXT,');
        console.log('ADD COLUMN IF NOT EXISTS subtitle TEXT,');
        console.log('ADD COLUMN IF NOT EXISTS icon TEXT,');
        console.log('ADD COLUMN IF NOT EXISTS logo TEXT,');
        console.log('ADD COLUMN IF NOT EXISTS split_data JSONB;');
        console.log('────────────────────────────────────────────────────────────────────');
        console.log('\n🔗 Direct link:');
        console.log('   https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/sql');
      }
      console.log('='.repeat(70));
    } else {
      console.log('✅ Insert SUCCEEDED!');
      console.log('   Transaction ID:', data[0].id);
      console.log('   Title:', data[0].title);
      console.log('   Subtitle:', data[0].subtitle);
      console.log('\n🎉 The transactions table has all required columns!');

      // Clean up
      await supabase
        .from('transactions')
        .delete()
        .eq('id', data[0].id);
      console.log('   (Test record deleted)');
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }

  console.log('\n✨ Done!\n');
}

testTransactionInsert().then(() => {
  process.exit(0);
});
