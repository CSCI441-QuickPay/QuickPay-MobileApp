/**
 * Apply Migration 007: Set Default Balance to $500
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigration() {
  console.log('\n📦 Applying Migration 007: Set Default Balance to $500\n');
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '007_set_default_balance_500.sql');
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
  console.log('3. Copy the entire contents of:');
  console.log('   supabase/migrations/007_set_default_balance_500.sql');
  console.log('4. Paste into the SQL Editor');
  console.log('5. Click "Run" or press Cmd/Ctrl + Enter\n');
  
  console.log('✨ After running the migration, all NEW users will automatically');
  console.log('   receive $500 in their QuickPay balance upon signup!\n');
}

applyMigration();
