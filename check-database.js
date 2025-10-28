// Quick Database Check
// Run this in browser console at http://localhost:3000

async function checkDatabase() {
  console.log('🔍 Checking database setup...\n');
  
  try {
    const { supabase } = await import('./src/supabase/client.js');
    
    // Check if users table exists
    console.log('1. Checking users table...');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Users table does not exist!');
        console.log('🔧 SOLUTION: You need to run the SQL schema in Supabase dashboard');
        console.log('   1. Go to: https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/sql');
        console.log('   2. Click "New query"');
        console.log('   3. Copy entire content from supabase_schema_policies.sql');
        console.log('   4. Click "Run"');
        return false;
      } else {
        console.log('❌ Database error:', error.message);
        return false;
      }
    }
    
    console.log('✅ Users table exists');
    
    // Check other tables
    const tables = ['uploads', 'schemes', 'contacts', 'pesticides', 'stats'];
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('*', { head: true });
      if (tableError) {
        console.log(`❌ Table '${table}' missing or inaccessible`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }
    
    console.log('\n2. Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Storage check failed:', bucketError.message);
    } else {
      const uploadsBucket = buckets.find(b => b.name === 'uploads');
      if (!uploadsBucket) {
        console.log('❌ Storage bucket "uploads" missing!');
        console.log('🔧 SOLUTION: Create storage bucket');
        console.log('   1. Go to: https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/storage/buckets');
        console.log('   2. Click "New bucket"');
        console.log('   3. Name: uploads');
        console.log('   4. Check "Public bucket"');
        console.log('   5. Click "Create bucket"');
      } else {
        console.log('✅ Storage bucket "uploads" exists');
      }
    }
    
    console.log('\n✅ Database check complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    return false;
  }
}

// Run the check
checkDatabase();