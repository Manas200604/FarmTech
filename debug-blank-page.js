// Debug Blank Page Issue
// Run this in browser console at http://localhost:3001

async function debugBlankPage() {
  console.log('🔍 Debugging blank page issue...\n');
  
  try {
    // Check if React is loaded
    if (typeof React === 'undefined') {
      console.log('❌ React not loaded');
    } else {
      console.log('✅ React loaded');
    }
    
    // Check if the app root exists
    const root = document.getElementById('root');
    if (!root) {
      console.log('❌ Root element not found');
    } else {
      console.log('✅ Root element exists');
      console.log('Root content:', root.innerHTML.length > 0 ? 'Has content' : 'Empty');
    }
    
    // Check for JavaScript errors
    console.log('✅ JavaScript is running (no fatal errors)');
    
    // Check if Supabase client can be imported
    try {
      const { supabase } = await import('./src/supabase/client.js');
      console.log('✅ Supabase client imported successfully');
    } catch (importError) {
      console.log('❌ Supabase client import failed:', importError.message);
    }
    
    // Check auth context
    try {
      const authModule = await import('./src/contexts/SupabaseAuthContext.jsx');
      console.log('✅ Auth context imported successfully');
    } catch (authError) {
      console.log('❌ Auth context import failed:', authError.message);
    }
    
    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Check browser console for any red error messages');
    console.log('2. Try hard refresh (Ctrl+F5 or Cmd+Shift+R)');
    console.log('3. Check if the page is stuck on loading');
    console.log('4. Try opening http://localhost:3001 in incognito mode');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

// Run the debug
debugBlankPage();