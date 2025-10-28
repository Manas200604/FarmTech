import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 FarmTech Test Page</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button works!')}>
        Test Button
      </button>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>✅ Success!</h3>
        <p>The page is loading correctly.</p>
        <p>Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default TestApp;