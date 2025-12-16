/**
 * Update process_payment RPC function to store negative amounts for debits
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function updateFunction() {
  console.log('\n🔧 Updating process_payment RPC Function\n');
  console.log('═'.repeat(80));

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_payment_processing.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('✅ Migration file loaded');
  console.log(`📄 File: ${migrationPath}\n`);

  console.log('This will recreate the process_payment function with the correct logic:');
  console.log('   • Line 89: -(v_source->>\'amount\')::decimal  -- Negative for debit\n');

  console.log('═'.repeat(80));
  console.log('FULL SQL to execute:\n');
  console.log(migrationSQL);
  console.log('═'.repeat(80));

  console.log('\n⚠️  IMPORTANT: You need to run this in Supabase Dashboard.\n');

  console.log('📋 INSTRUCTIONS:');
  console.log('1. Go to: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/sql');
  console.log('2. Click "+ New Query"');
  console.log('3. Copy the ENTIRE contents of:');
  console.log('   supabase/migrations/005_payment_processing.sql');
  console.log('4. Paste into the SQL Editor');
  console.log('5. Click "Run" or press Cmd/Ctrl + Enter\n');

  console.log('✨ This will:');
  console.log('   • DROP and recreate the process_payment function');
  console.log('   • Future sent transactions will be stored with negative amounts');
  console.log('   • Existing transactions need migration 009 to fix them\n');
}

updateFunction();
