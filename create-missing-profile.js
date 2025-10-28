// Create Missing User Profile
// Run this in browser console at http://localhost:3000

async function createMissingProfile() {
  console.log('👤 Creating missing user profile...\n');
  
  try {
    const { supabase } = await import('./src/supabase/client.js');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ No user logged in or error getting user:', userError?.message);
      return;
    }
    
    console.log('✅ Found logged in user:', user.email);
    console.log('User ID:', user.id);
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (existingProfile) {
      console.log('✅ User profile already exists:', existingProfile);
      return;
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Error checking profile:', checkError.message);
      return;
    }
    
    console.log('📝 Creating user profile...');
    
    // Create the missing profile
    const newProfile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email.split('@')[0],
      role: user.user_metadata?.role || 'farmer',
      phone: user.user_metadata?.phone || null,
      farm_location: null,
      crop_type: null,
      created_at: new Date().toISOString()
    };
    
    const { data: createdProfile, error: createError } = await supabase
      .from('users')
      .insert([newProfile])
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Failed to create profile:', createError.message);
      console.log('Error details:', createError);
      
      // Check if it's an RLS policy issue
      if (createError.message.includes('policy')) {
        console.log('🔧 This might be an RLS policy issue.');
        console.log('Try running the SQL schema again to ensure policies are correct.');
      }
    } else {
      console.log('✅ Profile created successfully!');
      console.log('Profile data:', createdProfile);
      console.log('\n🎉 Try refreshing the page - the error should be gone!');
    }
    
  } catch (error) {
    console.error('❌ Profile creation failed:', error);
  }
}

// Run the function
createMissingProfile();