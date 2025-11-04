import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAccess = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already logged in
    const adminStatus = sessionStorage.getItem('isAdmin');
    const loginTime = sessionStorage.getItem('adminLoginTime');
    
    if (adminStatus === 'true' && loginTime) {
      // Check if login is still valid (24 hours)
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsAdminLoggedIn(true);
      } else {
        // Clear expired session
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('adminLoginTime');
      }
    }
  }, []);

  const handleAdminLogin = (status) => {
    setIsAdminLoggedIn(status);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminLoginTime');
    setIsAdminLoggedIn(false);
    navigate('/');
  };

  return (
    <div>
      {isAdminLoggedIn ? (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <span style={{ marginRight: '10px' }}>🛡️ Admin Mode</span>
          <button
            onClick={handleAdminLogout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AdminAccess;