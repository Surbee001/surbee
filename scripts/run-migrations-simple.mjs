#!/usr/bin/env node

/**
 * Simple migration script that executes SQL files directly
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));

// Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Please check .env.local file');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Invalid Supabase URL');
  process.exit(1);
}

console.log('🚀 Database Migration Tool\n');
console.log(`   Project: ${projectRef}`);
console.log(`   URL: ${SUPABASE_URL}\n`);

async function executeMigration(filename, sql) {
  console.log(`📝 Applying: ${filename}`);

  try {
    // Use Supabase Management API to execute SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      console.log('   ✅ Success\n');
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ⚠️  Response: ${response.status} ${response.statusText}`);
      console.log(`   Details: ${errorText}\n`);

      // Try alternative: Direct SQL execution via pg connection string
      console.log('   💡 SQL can be applied manually via Dashboard');
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

  // Get only today's migrations
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .filter(f => f.includes('20250121')) // Today's migrations
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No migrations found for today (20250121)');
    return;
  }

  console.log(`Found ${files.length} migration(s):\n`);

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');

    await executeMigration(file, sql);
  }

  console.log('─'.repeat(60));
  console.log('\n📋 Manual Alternative:\n');
  console.log('   If automatic execution failed, apply manually:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('   2. Copy SQL from: supabase/migrations/');
  console.log('   3. Execute each migration file\n');
  console.log('   Files to apply:');
  files.forEach(f => console.log(`      - ${f}`));
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
