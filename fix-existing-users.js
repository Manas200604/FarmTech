// Fix Existing Users - Confirm them manually
// Run this in browser console at http://localhost:3000

async function fixExistingUsers() {
  console.log('🔧 Fixing existing unconfirmed users...\n');
  
  try {
    const { supabase } = await import('./src/supabase/client.js');
    
    console.log('Since existing users are still unconfirmed, you need to:');
    console.log('');
    console.log('OPTION 1: Manually confirm users in Supabase Dashboard');
    console.log('1. Go to: https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/auth/users');
    console.log('2. Find each user in the list');
    console.log('3. Click on the user');
    console.log('4. Toggle ON "Email Confirmed"');
    console.log('5. Save changes');
    console.log('');
    console.log('OPTION 2: Create fresh test users (recommended)');
    console.log('Since email confirmation is now disabled, new users will work immediately.');
    console.log('');
    
    // Create fresh test users
    console.log('Creating fresh test users...');
    
    const testUsers = [
      { email: 'testfarmer@farmtech.com', password: 'test123456', role: 'farmer', name: 'Test Farmer' },
      { email: 'testadmin@farmtech.com', password: 'test123456', role: 'admin', name: 'Test Admin' }
    ];
    
    for (const user of testUsers) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              name: user.name,
              role: user.role
            }
          }
        });
        
        if (error && !error.message.includes('already registered')) {
          console.log(`❌ Failed to create ${user.role}:`, error.message);
        } else {
          console.log(`✅ Created ${user.role}: ${user.email} / ${user.password}`);
          
          // Create user profile if user was created successfully
          if (data.user && !error) {
            const { error: profileError } = await supabase
              .from('users')
              .insert([{
                id: data.user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                created_at: new Date().toISOString()
              }]);
            
            if (profileError) {
              console.log(`⚠️ Profile creation failed for ${user.email}:`, profileError.message);
            }
          }
        }
      } catch (createError) {
        console.log(`❌ Error creating ${user.email}:`, createError.message);
      }
    }
    
    console.log('\n🎉 Fresh test users created!');
    console.log('Try logging in with:');
    console.log('👨‍🌾 Farmer: testfarmer@farmtech.com / test123456');
    console.log('👨‍💼 Admin: testadmin@farmtech.com / test123456');
    
  } catch (error) {
    console.error('❌ Fix script failed:', error);
  }
}

// Run the function
fixExistingUsers();