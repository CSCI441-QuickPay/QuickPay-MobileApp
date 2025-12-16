/**
 * Apply migration 005 to fix transaction dates
 * Run with: node scripts/apply-migration-005.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://orptfearwcypftrjkoaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycHRmZWFyd2N5cGZ0cmprb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY2MjAsImV4cCI6MjA3NzQxMjYyMH0.KJK1E_KamDPyRoL383fd6h_fiuVTweacjomAW4RgDlA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigration() {
  console.log('📦 Applying Migration 005: Fix Transaction Dates\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_fix_transaction_date.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('✅ Migration file loaded');
    console.log('📄 File:', migrationPath);
    console.log('\n' + '='.repeat(80));
    console.log('SQL to execute:\n');
    console.log(sql.substring(0, 500) + '...\n');
    console.log('='.repeat(80));

    console.log('\n⚠️  IMPORTANT: This migration cannot be applied via the anon key.');
    console.log('You need to run this SQL manually in Supabase Dashboard.\n');

    console.log('📋 INSTRUCTIONS:');
    console.log('1. Go to: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/sql');
    console.log('2. Click "+ New Query"');
    console.log('3. Copy the entire contents of:');
    console.log('   supabase/migrations/005_fix_transaction_date.sql');
    console.log('4. Paste into the SQL Editor');
    console.log('5. Click "Run" or press Cmd/Ctrl + Enter\n');

    console.log('✨ After running the migration, all new transactions will use CURRENT_DATE');
    console.log('   for the transaction_date field, ensuring correct date display.\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }

  console.log('✨ Done!\n');
}

applyMigration().then(() => {
  process.exit(0);
});
