// Check Tables and Fix Issues
// Run this in browser console at http://localhost:3000

async function checkTablesAndFix() {
  console.log('🔍 Checking database tables and fixing issues...\n');
  
  try {
    const { supabase } = await import('./src/supabase/client.js');
    
    // Check if users table exists and is accessible
    console.log('1. Checking users table...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          console.log('❌ CRITICAL: Users table does not exist!');
          console.log('🔧 SOLUTION: You must run the SQL schema in Supabase');
          console.log('   1. Go to: https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/sql');
          console.log('   2. Click "New query"');
          console.log('   3. Copy entire supabase_schema_policies.sql content');
          console.log('   4. Click "Run"');
          return false;
        } else {
          console.log('❌ Users table error:', error.message);
          console.log('Error code:', error.code);
          return false;
        }
      }
      
      console.log('✅ Users table exists and accessible');
      
    } catch (tableError) {
      console.log('❌ Users table check failed:', tableError.message);
      return false;
    }
    
    // Check current user and create profile if needed
    console.log('\n2. Checking current user profile...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ No user logged in:', userError?.message);
      return false;
    }
    
    console.log('✅ User logged in:', user.email);
    console.log('User ID:', user.id);
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('⚠️ User profile missing - creating it...');
        
        // Create the profile
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
          
          if (createError.message.includes('policy') || createError.code === '42501') {
            console.log('🔧 This is an RLS policy issue.');
            console.log('   The SQL schema might not have been run properly.');
            console.log('   Please run the complete SQL schema again.');
          }
          return false;
        } else {
          console.log('✅ Profile created successfully!');
          console.log('Profile:', createdProfile);
        }
      } else {
        console.log('❌ Profile check error:', profileError.message);
        return false;
      }
    } else {
      console.log('✅ User profile exists:', profile);
    }
    
    console.log('\n🎉 Everything looks good!');
    console.log('Try refreshing the page - the 406 error should be gone.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    return false;
  }
}

// Run the check
checkTablesAndFix();