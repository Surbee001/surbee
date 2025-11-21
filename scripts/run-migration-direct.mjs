import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🚀 Running database migration...\n');
console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

async function runMigration() {
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250112_add_preview_and_sandbox.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log();

    // Execute SQL via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!response.ok) {
      // If exec_sql doesn't work, try direct SQL execution via Postgres REST API
      console.log('ℹ️  Direct RPC not available, using alternative method...\n');

      // Execute via raw SQL endpoint
      const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          query: migrationSQL
        })
      });

      if (!sqlResponse.ok) {
        console.log('⚠️  Cannot run migration automatically via API.\n');
        console.log('📋 Please run the migration manually:\n');
        console.log('1. Go to: https://supabase.com/dashboard/project/infoyjrridmijajdsetx/editor');
        console.log('2. Click on "SQL Editor"');
        console.log('3. Click "+ New Query"');
        console.log('4. Copy and paste this SQL:\n');
        console.log('─'.repeat(60));
        console.log(migrationSQL);
        console.log('─'.repeat(60));
        console.log('\n5. Click "Run" (or press Cmd/Ctrl + Enter)\n');
        console.log('✨ The columns will be added to your projects table!\n');
        return;
      }
    }

    console.log('✅ Migration executed successfully!\n');
    console.log('The following columns have been added to the projects table:');
    console.log('  • preview_image (TEXT): Stores survey screenshots');
    console.log('  • sandbox_bundle (JSONB): Stores sandbox configuration\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Manual migration instructions:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/infoyjrridmijajdsetx/editor');
    console.log('2. Open SQL Editor');
    console.log('3. Run the migration file: supabase/migrations/20250112_add_preview_and_sandbox.sql\n');
  }
}

runMigration();
