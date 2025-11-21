const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running analysis_dots migration...\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250115_add_analysis_dots.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded\n');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // For Supabase, we need to execute the SQL directly
    // Since we don't have a custom exec_sql function, we'll provide manual instructions
    console.log('⚠️  This migration needs to be run manually through the Supabase dashboard.\n');
    console.log('📋 Manual migration steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the entire SQL from:');
    console.log(`   ${migrationPath}`);
    console.log('5. Click "Run" to execute\n');

    console.log('📄 Migration SQL Preview:');
    console.log('─'.repeat(60));
    console.log(migrationSQL.substring(0, 500) + '...\n');
    console.log('─'.repeat(60));

    console.log('\n✨ Once you run the migration in Supabase, the analysis_dots feature will be ready!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
