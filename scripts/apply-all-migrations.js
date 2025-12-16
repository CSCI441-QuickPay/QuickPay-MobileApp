/**
 * Apply All Pending Migrations - Complete Fix
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function applyAllMigrations() {
  console.log('\n📦 Apply All Pending Migrations - Complete Fix\n');
  console.log('═'.repeat(80));

  const migrations = [
    {
      number: '007',
      name: 'Set Default Balance to $500',
      file: '007_set_default_balance_500.sql',
      description: 'New users start with $500 QuickPay balance'
    },
    {
      number: '008',
      name: 'Make Description Optional',
      file: '008_make_description_optional.sql',
      description: 'Allows sending money without a note'
    },
    {
      number: '009',
      name: 'Fix Debit Amounts to be Negative',
      file: '009_fix_debit_amounts.sql',
      description: 'Fixes existing transactions to show correct colors'
    },
    {
      number: '010',
      name: 'Fix process_payment Function',
      file: '010_fix_process_payment_function.sql',
      description: 'Fixes function overloading conflict - CRITICAL FIX'
    }
  ];

  console.log('\n🔍 WHAT THIS FIXES:');
  console.log('   1. New users start with $500 QuickPay balance');
  console.log('   2. Allows sending money without entering a note');
  console.log('   3. Sent transactions show RED (negative amounts)');
  console.log('   4. Received transactions show GREEN (positive amounts)');
  console.log('   5. ✨ OTHER USERS CAN NOW SEND MONEY TO YOU ✨\n');

  console.log('═'.repeat(80));
  console.log('\n📋 INSTRUCTIONS:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/sql');
  console.log('   2. Click "+ New Query"');
  console.log('   3. Copy and paste ALL the SQL below');
  console.log('   4. Click "Run" or press Cmd/Ctrl + Enter\n');

  console.log('═'.repeat(80));
  console.log('COMBINED SQL TO EXECUTE:\n');
  console.log('-- ============================================================================');
  console.log('-- APPLY ALL MIGRATIONS - Copy this entire block');
  console.log('-- ============================================================================\n');

  for (const migration of migrations) {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migration.file);

    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Migration ${migration.file} not found, skipping...`);
      continue;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log(`-- ============================================================================`);
    console.log(`-- Migration ${migration.number}: ${migration.name}`);
    console.log(`-- ${migration.description}`);
    console.log(`-- ============================================================================`);
    console.log(migrationSQL);
    console.log('');
  }

  console.log('-- ============================================================================');
  console.log('-- END OF MIGRATIONS');
  console.log('-- ============================================================================\n');

  console.log('═'.repeat(80));
  console.log('\n✨ AFTER RUNNING THESE MIGRATIONS:\n');
  console.log('   ✅ New users will start with $500 QuickPay balance');
  console.log('   ✅ You can send money without a note');
  console.log('   ✅ Your sent transactions will show RED');
  console.log('   ✅ Your received transactions will show GREEN');
  console.log('   ✅ Other users CAN send money to you');
  console.log('   ✅ All profile avatars will show correctly\n');

  console.log('🧪 TEST IT:');
  console.log('   Run: node scripts/test-send-to-chanrattnak.js');
  console.log('   This will verify other users can send money to you\n');
}

applyAllMigrations();
