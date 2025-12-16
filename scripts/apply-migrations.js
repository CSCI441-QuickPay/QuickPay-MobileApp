/**
 * Apply All Pending Migrations
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function applyMigrations() {
  console.log('\n📦 Apply Pending Migrations\n');
  console.log('═'.repeat(80));

  const migrations = [
    {
      number: '008',
      name: 'Make Description Optional',
      file: '008_make_description_optional.sql'
    },
    {
      number: '009',
      name: 'Fix Debit Amounts to be Negative',
      file: '009_fix_debit_amounts.sql'
    }
  ];

  console.log('\n📋 INSTRUCTIONS:');
  console.log('1. Go to: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/sql');
  console.log('2. Click "+ New Query"');
  console.log('3. Copy and paste ALL the SQL below');
  console.log('4. Click "Run" or press Cmd/Ctrl + Enter\n');

  console.log('═'.repeat(80));
  console.log('COMBINED SQL TO EXECUTE:\n');

  for (const migration of migrations) {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migration.file);

    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Migration ${migration.file} not found, skipping...`);
      continue;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log(`-- Migration ${migration.number}: ${migration.name}`);
    console.log(migrationSQL);
    console.log('');
  }

  console.log('═'.repeat(80));
  console.log('\n✨ After running these migrations:');
  console.log('   1. You can send money without a note (description optional)');
  console.log('   2. Sent transactions will show RED (negative amounts)');
  console.log('   3. Received transactions will show GREEN (positive amounts)');
  console.log('   4. Profile avatars will show the correct person\n');
}

applyMigrations();
