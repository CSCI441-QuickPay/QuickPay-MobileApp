/**
 * Check Supabase database schema
 * Run with: node scripts/check-db.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orptfearwcypftrjkoaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycHRmZWFyd2N5cGZ0cmprb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY2MjAsImV4cCI6MjA3NzQxMjYyMH0.KJK1E_KamDPyRoL383fd6h_fiuVTweacjomAW4RgDlA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database Schema\n');

  try {
    // Try to query transactions table
    console.log('1. Checking transactions table...');
    const { data: txnData, error: txnError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);

    if (txnError) {
      console.log('   ❌ transactions table does NOT exist');
      console.log('   Error:', txnError.message);
    } else {
      console.log('   ✅ transactions table exists');
      if (txnData && txnData.length > 0) {
        console.log('   Columns:', Object.keys(txnData[0]));
      }
    }

    // Try to query users table
    console.log('\n2. Checking users table...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (userError) {
      console.log('   ❌ users table does NOT exist');
      console.log('   Error:', userError.message);
    } else {
      console.log('   ✅ users table exists');
    }

    // Try to query bank_accounts table
    console.log('\n3. Checking bank_accounts table...');
    const { data: bankData, error: bankError } = await supabase
      .from('bank_accounts')
      .select('*')
      .limit(1);

    if (bankError) {
      console.log('   ❌ bank_accounts table does NOT exist');
      console.log('   Error:', bankError.message);
    } else {
      console.log('   ✅ bank_accounts table exists');
    }

    // Try to call process_payment function
    console.log('\n4. Checking process_payment function...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('process_payment', {
      p_sender_id: '00000000-0000-0000-0000-000000000000',
      p_recipient_account_number: 'TEST123',
      p_sources: [],
      p_total_amount: 0,
      p_description: 'test'
    });

    if (rpcError) {
      if (rpcError.message.includes('does not exist') || rpcError.message.includes('not found')) {
        console.log('   ❌ process_payment function does NOT exist');
      } else {
        console.log('   ✅ process_payment function exists (got expected error)');
      }
      console.log('   Error:', rpcError.message);
    } else {
      console.log('   ✅ process_payment function exists');
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 ACTION REQUIRED:');
  console.log('='.repeat(60));
  console.log('\nIf any tables or functions are missing:');
  console.log('1. Go to: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/sql');
  console.log('2. Click "+ New Query"');
  console.log('3. Copy and run each migration file in this order:\n');
  console.log('   ✓ supabase/migrations/001_create_users_table.sql');
  console.log('   ✓ supabase/migrations/002_add_account_number_generation.sql');
  console.log('   ✓ supabase/migrations/002_create_favorites_table.sql');
  console.log('   ✓ supabase/migrations/003_payment_processing.sql');
  console.log('   ✓ supabase/migrations/004_add_transaction_display_fields.sql');
  console.log('\n' + '='.repeat(60));
}

checkDatabase().then(() => {
  console.log('\n✨ Done!\n');
  process.exit(0);
});
