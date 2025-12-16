/**
 * Manual migration runner for Supabase
 * Run with: npx ts-node scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - EXPO_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_KEY');
  console.error('\nMake sure these are set in your .env file');
  process.exit(1);
}

// Create admin client with service key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration(migrationFile: string) {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);

  console.log(`\n📄 Reading migration: ${migrationFile}`);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`\n🔄 Applying migration...`);
  console.log(`SQL:\n${sql}\n`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('⚠️  exec_sql RPC not found, trying direct execution...');

      // Split SQL into statements and execute each
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: stmtError } = await (supabase as any).rpc('query', {
          query_text: statement
        });

        if (stmtError) {
          console.error('❌ Error executing statement:', stmtError);
          throw stmtError;
        }
      }
    }

    console.log('✅ Migration applied successfully!');

  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

// Get migration file from command line or use default
const migrationFile = process.argv[2] || '004_add_transaction_display_fields.sql';

console.log('🚀 Supabase Migration Runner');
console.log('============================');
console.log(`Supabase URL: ${supabaseUrl}`);

runMigration(migrationFile).then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});
