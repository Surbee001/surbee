import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  try {
    // Try to select the new columns
    const { data, error } = await supabase
      .from('projects')
      .select('id, preview_image, sandbox_bundle')
      .limit(1);

    if (error) {
      console.error('❌ Migration verification failed!');
      console.error(`   Error: ${error.message}\n`);
      console.log('The columns may not have been added yet.');
      console.log('Please run the migration in Supabase dashboard.\n');
      process.exit(1);
    }

    console.log('✅ Migration verified successfully!\n');
    console.log('The following columns are now available in the projects table:');
    console.log('  ✓ preview_image');
    console.log('  ✓ sandbox_bundle\n');

    if (data && data.length > 0) {
      console.log(`📊 Found ${data.length} existing project(s)`);
      console.log('   (New columns will be NULL until populated)\n');
    } else {
      console.log('📊 No projects found yet (table is ready for new entries)\n');
    }

    console.log('🎉 You can now use the preview image functionality!\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

verifyMigration();
