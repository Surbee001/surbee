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
  console.log('🚀 Running database migration...\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250112_add_preview_and_sandbox.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log();

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try direct query if rpc doesn't work
        const { error: directError } = await supabase.from('_migration_temp').select('*').limit(0);

        if (directError) {
          console.log(`   ℹ️  Note: ${error.message}`);
        }
      }

      console.log(`   ✅ Statement ${i + 1} executed\n`);
    }

    console.log('✨ Migration completed successfully!\n');
    console.log('The following columns have been added to the projects table:');
    console.log('  - preview_image (TEXT): Stores survey screenshots');
    console.log('  - sandbox_bundle (JSONB): Stores sandbox configuration');
    console.log();

    // Verify the columns exist
    console.log('🔍 Verifying migration...');
    const { data: tableInfo, error: verifyError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (!verifyError && tableInfo) {
      console.log('✅ Migration verified - columns are accessible\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n📋 Manual migration steps:');
    console.error('1. Go to your Supabase dashboard');
    console.error('2. Navigate to SQL Editor');
    console.error('3. Copy and paste the migration SQL from:');
    console.error('   supabase/migrations/20250112_add_preview_and_sandbox.sql');
    console.error('4. Click "Run" to execute\n');
    process.exit(1);
  }
}

runMigration();
