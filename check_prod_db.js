const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to:', supabaseUrl);
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDatabase() {
  try {
    // Try to list all tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      console.log('Error querying tables:', error.message);

      // Try a different approach - check if users table exists
      console.log('\nTrying to query users table...');
      const { data: users, error: userError } = await supabase.from('users').select('*').limit(1);

      if (userError) {
        console.log('❌ Users table does not exist or cannot be queried');
        console.log('Error:', userError.message);
        console.log('Error code:', userError.code);
      } else {
        console.log('✅ Users table exists');
      }
    } else {
      console.log('Tables found in public schema:');
      if (data && data.length > 0) {
        data.forEach((t) => console.log(`  - ${t.table_name}`));
      } else {
        console.log('  (no tables found)');
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkDatabase();
