const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'db.infoyjrridmijajdsetx.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'iyisWfi8iicaMBy6',
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connected to Supabase...');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../src/lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute the schema
    console.log('Creating tables and policies...');
    await client.query(schema);

    console.log('✅ Database initialized successfully!');
    console.log('\nTables created:');
    console.log('  - projects');
    console.log('  - survey_responses');
    console.log('  - survey_analytics');
    console.log('  - chat_messages');
    console.log('\nRow Level Security (RLS) policies enabled');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
