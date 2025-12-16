/**
 * Apply Migration 009: Fix Debit Amounts to be Negative
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('\n📦 Applying Migration 009: Fix Debit Amounts to be Negative\n');

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '009_fix_debit_amounts.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('✅ Migration file loaded');
  console.log(`📄 File: ${migrationPath}\n`);

  console.log('═'.repeat(80));
  console.log('SQL to execute:\n');
  console.log(migrationSQL);
  console.log('═'.repeat(80));

  console.log('\n⚠️  IMPORTANT: This migration cannot be applied via the anon key.');
  console.log('You need to run this SQL manually in Supabase Dashboard.\n');

  console.log('📋 INSTRUCTIONS:');
  console.log('1. Go to: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/sql');
  console.log('2. Click "+ New Query"');
  console.log('3. Copy the SQL above');
  console.log('4. Paste into the SQL Editor');
  console.log('5. Click "Run" or press Cmd/Ctrl + Enter\n');

  console.log('✨ After running the migration:');
  console.log('   • All sent transactions will show RED (negative amounts)');
  console.log('   • Received transactions will show GREEN (positive amounts)');
  console.log('   • Profile avatars will show the correct recipient\n');
}

applyMigration();
