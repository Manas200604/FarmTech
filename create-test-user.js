// Create Test User Script
// Run this in browser console at http://localhost:3000

async function createTestUser() {
  console.log('👤 Creating test user for login...\n');
  
  try {
    const { supabase } = await import('./src/supabase/client.js');
    
    // Test user credentials
    const testEmail = 'farmer@farmtech.com';
    const testPassword = 'farmer123456';
    const adminEmail = 'admin@farmtech.com';
    const adminPassword = 'admin123456';
    
    console.log('1. Creating farmer test user...');
    
    // Create farmer user
    const { data: farmerData, error: farmerError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test Farmer',
          role: 'farmer'
        }
      }
    });
    
    if (farmerError && !farmerError.message.includes('already registered')) {
      console.log('❌ Farmer creation failed:', farmerError.message);
    } else {
      console.log('✅ Farmer user created/exists:', testEmail);
      
      // Create farmer profile if user was created
      if (farmerData.user && !farmerError) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: farmerData.user.id,
            email: testEmail,
            name: 'Test Farmer',
            role: 'farmer',
            farm_location: 'Test Farm Location',
            crop_type: 'Rice',
            created_at: new Date().toISOString()
          }]);
        
        if (profileError) {
          console.log('⚠️ Farmer profile creation failed:', profileError.message);
        } else {
          console.log('✅ Farmer profile created');
        }
      }
    }
    
    console.log('\n2. Creating admin test user...');
    
    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: 'Test Admin',
          role: 'admin'
        }
      }
    });
    
    if (adminError && !adminError.message.includes('already registered')) {
      console.log('❌ Admin creation failed:', adminError.message);
    } else {
      console.log('✅ Admin user created/exists:', adminEmail);
      
      // Create admin profile if user was created
      if (adminData.user && !adminError) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: adminData.user.id,
            email: adminEmail,
            name: 'Test Admin',
            role: 'admin',
            created_at: new Date().toISOString()
          }]);
        
        if (profileError) {
          console.log('⚠️ Admin profile creation failed:', profileError.message);
        } else {
          console.log('✅ Admin profile created');
        }
      }
    }
    
    console.log('\n🎉 Test users ready!');
    console.log('\nYou can now login with:');
    console.log('👨‍🌾 Farmer: farmer@farmtech.com / farmer123456');
    console.log('👨‍💼 Admin: admin@farmtech.com / admin123456');
    console.log('\nTry logging in now!');
    
  } catch (error) {
    console.error('❌ User creation failed:', error);
    console.log('\nMake sure you:');
    console.log('1. Ran the SQL schema in Supabase dashboard');
    console.log('2. Created the uploads storage bucket');
  }
}

// Run the function
createTestUser();