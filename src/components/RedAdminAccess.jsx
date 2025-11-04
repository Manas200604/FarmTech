import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RedAdminDashboard from '../pages/RedAdminDashboard';

const RedAdminAccess = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    const loginTime = sessionStorage.getItem('adminLoginTime');
    
    if (isAdmin === 'true' && loginTime) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
      
      // Session expires after 24 hours
      if (hoursDiff < 24) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('adminLoginTime');
        navigate('/admin-login');
      }
    } else {
      navigate('/admin-login');
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #fecaca',
            borderTop: '4px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#dc2626', fontSize: '16px' }}>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(220,38,38,0.1)',
          border: '2px solid #fecaca',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '20px' }}>🔴 Access Denied</h2>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>
            You need to login as admin to access this page.
          </p>
          <button
            onClick={() => navigate('/admin-login')}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            🔑 Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return <RedAdminDashboard />;
};

export default RedAdminAccess;