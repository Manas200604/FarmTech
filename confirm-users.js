// Confirm All Users Script
// This will manually confirm all users so they can login
// Run this in browser console at http://localhost:3000

async function confirmAllUsers() {
  console.log('📧 Confirming all users for login...\n');
  
  try {
    const { supabase } = await import('./src/supabase/client.js');
    
    // Note: This requires admin access to auth.users table
    // The better solution is to disable email confirmation in Supabase settings
    
    console.log('⚠️ This script requires admin database access.');
    console.log('🔧 BETTER SOLUTION: Disable email confirmation in Supabase settings');
    console.log('');
    console.log('1. Go to: https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/auth/settings');
    console.log('2. Find "Enable email confirmations"');
    console.log('3. Toggle it OFF (disable it)');
    console.log('4. Click Save');
    console.log('5. Try logging in again');
    console.log('');
    console.log('This will allow users to login immediately without email confirmation.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the function
confirmAllUsers();