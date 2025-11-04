import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminLogin = ({ onAdminLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check against environment variables
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

      if (credentials.email === adminEmail && credentials.password === adminPassword) {
        // Store admin session
        sessionStorage.setItem('isAdmin', 'true');
        sessionStorage.setItem('adminLoginTime', new Date().toISOString());
        
        toast.success('Admin login successful!');
        onAdminLogin(true);
        navigate('/red-admin');
      } else {
        toast.error('Invalid admin credentials');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Admin Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>🛡️ ADMIN LOGIN</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              FarmTech Administration Portal
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Admin Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({
                ...credentials,
                email: e.target.value
              })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Admin Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '🔄 Logging in...' : '🛡️ Login as Admin'}
          </button>
        </form>

        {/* Security Notice */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px'
        }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#92400e',
            textAlign: 'center'
          }}>
            🔒 Secure admin access with environment-based authentication
          </p>
        </div>

        {/* Back to App */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            ← Back to FarmTech App
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;