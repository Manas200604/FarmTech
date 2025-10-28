// Simple Login Test
// Run this in browser console at http://localhost:3000

async function testLogin() {
  console.log('🔐 Testing Login Functionality...\n');
  
  try {
    const { supabase } = await import('./src/supabase/client.js');
    
    // Test 1: Check if we can connect to auth
    console.log('1. Testing auth connection...');
    const { data: session } = await supabase.auth.getSession();
    console.log('✅ Auth connection successful');
    
    // Test 2: Try to create a test user first
    console.log('\n2. Creating test user...');
    const testEmail = 'testuser@farmtech.com';
    const testPassword = 'test123456';
    
    // First, try to sign up
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
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.log('❌ Sign up failed:', signUpError.message);
      return;
    }
    
    console.log('✅ User creation successful (or user already exists)');
    
    // Test 3: Try to login
    console.log('\n3. Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      console.log('Error details:', loginError);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('User data:', loginData.user);
    
    // Test 4: Try to fetch user profile
    console.log('\n4. Testing user profile fetch...');
    if (loginData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', loginData.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile fetch failed:', profileError.message);
        console.log('This might be the issue! The user might not have a profile in the users table.');
        
        // Try to create the profile
        console.log('\n5. Attempting to create missing profile...');
        const { error: createError } = await supabase
          .from('users')
          .insert([{
            id: loginData.user.id,
            email: testEmail,
            name: 'Test User',
            role: 'farmer',
            created_at: new Date().toISOString()
          }]);
        
        if (createError) {
          console.log('❌ Profile creation failed:', createError.message);
          console.log('Check if the users table exists and RLS policies are correct');
        } else {
          console.log('✅ Profile created successfully');
        }
      } else {
        console.log('✅ Profile fetch successful');
        console.log('Profile data:', profile);
      }
    }
    
    // Test 5: Logout
    console.log('\n6. Testing logout...');
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      console.log('❌ Logout failed:', logoutError.message);
    } else {
      console.log('✅ Logout successful');
    }
    
    console.log('\n🎉 Login test completed!');
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
  }
}

// Run the test
testLogin();