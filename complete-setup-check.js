// Complete Setup Check - Diagnose all issues
// Run this in browser console at http://localhost:3000

async function completeSetupCheck() {
  console.log('🔍 Complete Supabase Setup Check...\n');
  
  try {
    const { supabase } = await import('./src/supabase/client.js');
    
    // Check 1: Basic connection
    console.log('1. Testing basic connection...');
    try {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01') {
          console.log('❌ CRITICAL: Users table does not exist!');
          console.log('🔧 FIX: Run the SQL schema in Supabase dashboard');
          console.log('   Go to: https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/sql');
          console.log('   Copy entire supabase_schema_policies.sql content and run it');
          return false;
        } else {
          console.log('❌ Database error:', error.message);
          return false;
        }
      }
      console.log('✅ Database connection working');
    } catch (connError) {
      console.log('❌ Connection failed:', connError.message);
      return false;
    }
    
    // Check 2: All required tables
    console.log('\n2. Checking all required tables...');
    const tables = ['users', 'uploads', 'schemes', 'contacts', 'pesticides', 'stats'];
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' });
        if (error) {
          console.log(`❌ Table '${table}' missing or inaccessible:`, error.message);
          allTablesExist = false;
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (tableError) {
        console.log(`❌ Table '${table}' check failed:`, tableError.message);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.log('\n🔧 SOLUTION: Run the complete SQL schema');
      console.log('   1. Go to Supabase SQL Editor');
      console.log('   2. Copy entire supabase_schema_policies.sql content');
      console.log('   3. Run it to create all tables and policies');
      return false;
    }
    
    // Check 3: Storage bucket
    console.log('\n3. Checking storage bucket...');
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.log('❌ Storage access failed:', bucketError.message);
      } else {
        const uploadsBucket = buckets.find(b => b.name === 'uploads');
        if (!uploadsBucket) {
          console.log('❌ Storage bucket "uploads" missing');
          console.log('🔧 FIX: Create storage bucket in Supabase dashboard');
        } else {
          console.log('✅ Storage bucket "uploads" exists');
        }
      }
    } catch (storageError) {
      console.log('❌ Storage check failed:', storageError.message);
    }
    
    // Check 4: Auth settings
    console.log('\n4. Testing auth system...');
    try {
      const { data: session } = await supabase.auth.getSession();
      console.log('✅ Auth system accessible');
    } catch (authError) {
      console.log('❌ Auth system error:', authError.message);
    }
    
    // Check 5: Try to create a test user
    console.log('\n5. Testing user creation...');
    const testEmail = `test-${Date.now()}@farmtech.com`;
    const testPassword = 'test123456';
    
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Test User',
            role: 'farmer'
          }
        }
      });
      
      if (signUpError) {
        console.log('❌ User creation failed:', signUpError.message);
      } else {
        console.log('✅ User creation working');
        
        // Try to create profile
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: signUpData.user.id,
              email: testEmail,
              name: 'Test User',
              role: 'farmer',
              created_at: new Date().toISOString()
            }]);
          
          if (profileError) {
            console.log('❌ Profile creation failed:', profileError.message);
            console.log('   This might be due to RLS policies');
          } else {
            console.log('✅ Profile creation working');
          }
        }
        
        // Try to login immediately
        console.log('\n6. Testing immediate login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });
        
        if (loginError) {
          console.log('❌ Login failed:', loginError.message);
          if (loginError.message.includes('Email not confirmed')) {
            console.log('🔧 Email confirmation is still enabled or user needs manual confirmation');
            console.log('   Go to Supabase Auth Users and manually confirm this user');
          }
        } else {
          console.log('✅ Login working! Email confirmation is properly disabled');
        }
      }
    } catch (testError) {
      console.log('❌ User creation test failed:', testError.message);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('If you see ❌ errors above, fix them in order:');
    console.log('1. Run SQL schema if tables are missing');
    console.log('2. Create storage bucket if missing');
    console.log('3. Manually confirm existing users or create new ones');
    
    return true;
    
  } catch (error) {
    console.error('❌ Complete check failed:', error);
    return false;
  }
}

// Run the complete check
completeSetupCheck();