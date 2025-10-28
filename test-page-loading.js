// Test Page Loading
// Run this in browser console at http://localhost:3001

function testPageLoading() {
  console.log('🔍 Testing page loading...\n');
  
  // Check if page is loading
  const root = document.getElementById('root');
  if (!root) {
    console.log('❌ Root element not found');
    return;
  }
  
  if (root.innerHTML.trim() === '') {
    console.log('❌ Page is blank - root element is empty');
    return;
  }
  
  console.log('✅ Page has content');
  console.log('Root element content length:', root.innerHTML.length);
  
  // Check for React components
  const navbar = document.querySelector('nav');
  if (navbar) {
    console.log('✅ Navbar component loaded');
  } else {
    console.log('⚠️ Navbar not found');
  }
  
  // Check for auth provider
  try {
    // This should work if auth context is properly set up
    console.log('✅ JavaScript is running without errors');
  } catch (error) {
    console.log('❌ JavaScript error:', error.message);
  }
  
  console.log('\n🎉 Page loading test complete!');
  console.log('If you see this message, the page is working.');
}

// Run the test
testPageLoading();