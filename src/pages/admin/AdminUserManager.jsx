import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import toast from 'react-hot-toast';

const AdminUserManager = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check admin authentication
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
    
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const updateUserRole = async (userId, newRole, userName) => {
    if (!confirm(`Change role of "${userName}" to ${newRole}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.farm_location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          <h2 style={{ color: '#dc2626' }}>Loading Users...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef2f2' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(220,38,38,0.2)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
              👥 User Management
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              Manage all platform users
            </p>
          </div>
          <button
            onClick={() => navigate('/red-admin')}
            style={{
              backgroundColor: '#b91c1c',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Search and Filter */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
          border: '2px solid #fecaca'
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search users by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '300px',
                padding: '10px',
                border: '2px solid #fecaca',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { id: 'all', name: 'All Users', count: users.length },
                { id: 'farmer', name: 'Farmers', count: users.filter(u => u.role === 'farmer').length },
                { id: 'admin', name: 'Admins', count: users.filter(u => u.role === 'admin').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  style={{
                    backgroundColor: filter === tab.id ? '#dc2626' : 'white',
                    color: filter === tab.id ? 'white' : '#dc2626',
                    border: `2px solid ${filter === tab.id ? '#dc2626' : '#fecaca'}`,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
          border: '2px solid #fecaca',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '2px solid #fecaca' }}>
            <h2 style={{ color: '#dc2626', margin: 0, fontSize: '20px' }}>
              {filter === 'all' ? 'All Users' : `${filter.charAt(0).toUpperCase() + filter.slice(1)}s`} ({filteredUsers.length})
            </h2>
          </div>
          
          {filteredUsers.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#dc2626', padding: '40px', fontSize: '16px' }}>
              No users found matching your criteria
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fef2f2' }}>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626', fontWeight: '600' }}>User</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626', fontWeight: '600' }}>Contact</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626', fontWeight: '600' }}>Role</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626', fontWeight: '600' }}>Farm Details</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626', fontWeight: '600' }}>Joined</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #fecaca' }}>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '2px' }}>
                            {user.name || 'N/A'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#7f1d1d' }}>
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ color: '#dc2626', marginBottom: '2px', fontSize: '14px' }}>
                            📧 {user.email || 'N/A'}
                          </div>
                          <div style={{ color: '#7f1d1d', fontSize: '14px' }}>
                            📱 {user.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            backgroundColor: user.role === 'admin' ? '#dc2626' : '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {user.role === 'admin' ? '🛡️ Admin' : '🌾 Farmer'}
                          </span>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => updateUserRole(user.id, 'admin', user.name)}
                              style={{
                                backgroundColor: 'transparent',
                                color: '#dc2626',
                                border: '1px solid #dc2626',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              Make Admin
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ color: '#dc2626', marginBottom: '2px', fontSize: '14px' }}>
                            📍 {user.farm_location || 'N/A'}
                          </div>
                          <div style={{ color: '#7f1d1d', fontSize: '14px' }}>
                            🌾 {user.crop_type || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px', color: '#7f1d1d' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminUserManager;