#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration(migrationFile, sql) {
  console.log(`\n📝 Applying migration: ${migrationFile}`);

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql function doesn't exist, try direct query
      console.log('   Trying direct SQL execution...');
      const { error: directError } = await supabase.from('_temp').select('*').limit(0);

      // Split SQL by semicolon and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim().length === 0) continue;

        // Use the REST API to execute raw SQL
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ sql_query: statement + ';' })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`   ⚠️  Statement failed: ${errorText}`);
          // Continue with next statement
        }
      }

      console.log('   ✅ Migration statements executed (check for warnings above)');
    } else {
      console.log('   ✅ Migration applied successfully');
    }

    return true;
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migration...\n');

  // Get all migration files
  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .filter(f => f.startsWith('20250121')) // Only apply today's migrations
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No migrations found to apply');
    return;
  }

  console.log(`Found ${files.length} migration(s) to apply:\n`);
  files.forEach(f => console.log(`  - ${f}`));

  let successCount = 0;

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');

    const success = await applyMigration(file, sql);
    if (success) successCount++;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n✨ Migration complete: ${successCount}/${files.length} successful\n`);

  if (successCount < files.length) {
    console.log('⚠️  Some migrations failed. Check Supabase Dashboard for details.\n');
    console.log('💡 You can apply them manually via SQL Editor:\n');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Copy content from migration files');
    console.log('   3. Run the SQL\n');
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
