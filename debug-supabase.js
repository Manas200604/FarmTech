// Comprehensive Supabase Debug Script
// Run this in browser console at http://localhost:3000

async function debugSupabase() {
  console.log('🔍 Debugging Supabase Connection and Login Issues...\n');
  
  try {
    // Step 1: Test basic connection
    console.log('1. Testing Supabase client initialization...');
    
    // Check if environment variables are loaded
    console.log('Environment check:');
    console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('- VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Import supabase client
    const { supabase } = await import('./src/supabase/client.js');
    console.log('✅ Supabase client imported successfully');
    
    // Step 2: Test database connection
    console.log('\n2. Testing database connection...');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      console.log('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    console.log('✅ Database connection successful');
    
    // Step 3: Check if tables exist
    console.log('\n3. Checking required tables...');
    const tables = ['users', 'uploads', 'schemes', 'contacts', 'pesticides', 'stats'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('*', { head: true, count: 'exact' });
        if (tableError) {
          console.log(`❌ Table '${table}' error:`, tableError.message);
          if (tableError.code === '42P01') {
            console.log(`   → Table '${table}' does not exist. Run the SQL schema!`);
          }
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' check failed:`, err.message);
      }
    }
    
    // Step 4: Test authentication system
    console.log('\n4. Testing authentication system...');
    
    // Check current session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('❌ Session check failed:', sessionError.message);
    } else {
      console.log('✅ Auth system accessible');
      console.log('Current session:', session.session ? 'Logged in' : 'Not logged in');
    }
    
    // Step 5: Test user registration (with a test user)
    console.log('\n5. Testing user registration...');
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
        console.log('❌ Registration test failed:', signUpError.message);
        console.log('Error details:', signUpError);
      } else {
        console.log('✅ Registration system working');
        
        // Try to create user profile
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
            console.log('❌ User profile creation failed:', profileError.message);
            console.log('This might be the login issue! Check RLS policies.');
          } else {
            console.log('✅ User profile creation working');
          }
        }
      }
    } catch (regError) {
      console.log('❌ Registration test error:', regError.message);
    }
    
    // Step 6: Test storage
    console.log('\n6. Testing storage bucket...');
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.log('❌ Storage access failed:', bucketError.message);
      } else {
        const uploadsBucket = buckets.find(bucket => bucket.name === 'uploads');
        if (!uploadsBucket) {
          console.log('❌ Storage bucket "uploads" not found');
          console.log('Available buckets:', buckets.map(b => b.name));
        } else {
          console.log('✅ Storage bucket "uploads" exists');
          console.log('Bucket details:', uploadsBucket);
        }
      }
    } catch (storageError) {
      console.log('❌ Storage test failed:', storageError.message);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('If you see any ❌ errors above, those need to be fixed.');
    console.log('\nCommon issues:');
    console.log('1. Tables not created → Run SQL schema in Supabase dashboard');
    console.log('2. RLS policy errors → Check if policies were created correctly');
    console.log('3. Storage bucket missing → Create "uploads" bucket in Supabase');
    console.log('4. Environment variables → Check .env file');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
    console.log('Make sure you are running this on http://localhost:3000');
  }
}

// Auto-run the debug
debugSupabase();