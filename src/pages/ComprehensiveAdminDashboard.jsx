import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

const ComprehensiveAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUploads: 0,
    pendingUploads: 0,
    totalSchemes: 0,
    totalContacts: 0
  });
  
  // Data states
  const [uploads, setUploads] = useState([]);
  const [users, setUsers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [pesticides, setPesticides] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUploads(),
        loadUsers(),
        loadSchemes(),
        loadContacts(),
        loadPesticides()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get stats from database
      const { data: statsData } = await supabase.from('stats').select('*').single();
      
      // Get real counts
      const { data: users } = await supabase.from('users').select('id');
      const { data: uploads } = await supabase.from('uploads').select('id, status');
      const { data: schemes } = await supabase.from('schemes').select('id');
      const { data: contacts } = await supabase.from('contacts').select('id');

      const pendingUploads = uploads?.filter(u => u.status === 'pending').length || 0;

      setStats({
        totalUsers: users?.length || 0,
        totalUploads: uploads?.length || 0,
        pendingUploads,
        totalSchemes: schemes?.length || 0,
        totalContacts: contacts?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select(`
          *,
          users (name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error('Error loading uploads:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchemes(data || []);
    } catch (error) {
      console.error('Error loading schemes:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadPesticides = async () => {
    try {
      const { data, error } = await supabase
        .from('pesticides')
        .select('*')
        .order('name');

      if (error) throw error;
      setPesticides(data || []);
    } catch (error) {
      console.error('Error loading pesticides:', error);
    }
  };

  const handleUploadAction = async (uploadId, action, feedback = '') => {
    try {
      const { error } = await supabase
        .from('uploads')
        .update({ 
          status: action,
          admin_feedback: feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', uploadId);

      if (error) throw error;

      toast.success(`Upload ${action} successfully`);
      loadUploads();
      loadStats();
    } catch (error) {
      console.error('Error updating upload:', error);
      toast.error('Failed to update upload');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deleted successfully');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const deleteScheme = async (schemeId) => {
    if (!confirm('Are you sure you want to delete this scheme?')) return;

    try {
      const { error } = await supabase
        .from('schemes')
        .delete()
        .eq('id', schemeId);

      if (error) throw error;

      toast.success('Scheme deleted successfully');
      loadSchemes();
      loadStats();
    } catch (error) {
      console.error('Error deleting scheme:', error);
      toast.error('Failed to delete scheme');
    }
  };

  const tabs = [
    { id: 'overview', name: '📊 Overview', icon: '📊' },
    { id: 'analytics', name: '📈 Analytics', icon: '📈' },
    { id: 'uploads', name: '📤 Upload Reviews', icon: '📤' },
    { id: 'users', name: '👥 User Management', icon: '👥' },
    { id: 'schemes', name: '📋 Scheme Management', icon: '📋' },
    { id: 'contacts', name: '📞 Contact Management', icon: '📞' },
    { id: 'pesticides', name: '🧪 Pesticide Management', icon: '🧪' }
  ];

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ color: '#374151' }}>Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Admin Header */}
      <div style={{
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            🛡️ FARMTECH ADMIN DASHBOARD
          </h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
            Complete system administration and management
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Navigation Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: activeTab === tab.id ? '#dc2626' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#374151',
                border: activeTab === tab.id ? 'none' : '1px solid #d1d5db',
                padding: '10px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#3b82f6', margin: '0 0 10px 0' }}>👥 Total Users</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                  {stats.totalUsers}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#10b981', margin: '0 0 10px 0' }}>📤 Total Uploads</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                  {stats.totalUploads}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#f59e0b', margin: '0 0 10px 0' }}>⏳ Pending Reviews</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                  {stats.pendingUploads}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#8b5cf6', margin: '0 0 10px 0' }}>📋 Total Schemes</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                  {stats.totalSchemes}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>📞 Expert Contacts</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                  {stats.totalContacts}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#1f2937', marginBottom: '15px' }}>🚀 Quick Actions</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <button
                  onClick={() => setActiveTab('analytics')}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  � Vieiw Analytics
                </button>

                <button
                  onClick={() => setActiveTab('uploads')}
                  style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  � Review Usploads ({stats.pendingUploads})
                </button>
                
                <button
                  onClick={() => setActiveTab('users')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  � MManage Users ({stats.totalUsers})
                </button>
                
                <button
                  onClick={() => setActiveTab('schemes')}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  � Manage  Schemes ({stats.totalSchemes})
                </button>
                
                <button
                  onClick={loadAllData}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  🔄 Refresh All Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <AnalyticsDashboard />
          </div>
        )}

        {/* Upload Reviews Tab */}
        {activeTab === 'uploads' && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>📤 Upload Reviews</h2>
            
            {uploads.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                No uploads found
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {uploads.map((upload) => (
                  <div key={upload.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: upload.status === 'pending' ? '#fef3c7' : '#f3f4f6'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>
                          {upload.users?.name || 'Unknown User'}
                        </h4>
                        <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '14px' }}>
                          {upload.users?.email}
                        </p>
                        <p style={{ margin: '0 0 10px 0', color: '#374151' }}>
                          <strong>Crop:</strong> {upload.crop_type} | 
                          <strong> Status:</strong> {upload.status} |
                          <strong> Date:</strong> {new Date(upload.created_at).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '0 0 10px 0', color: '#374151' }}>
                          <strong>Description:</strong> {upload.description}
                        </p>
                        {upload.admin_feedback && (
                          <p style={{ margin: '0 0 10px 0', color: '#374151' }}>
                            <strong>Admin Feedback:</strong> {upload.admin_feedback}
                          </p>
                        )}
                      </div>
                      
                      {upload.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
                          <button
                            onClick={() => {
                              const feedback = prompt('Enter feedback (optional):');
                              handleUploadAction(upload.id, 'approved', feedback || '');
                            }}
                            style={{
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => {
                              const feedback = prompt('Enter rejection reason:');
                              if (feedback) {
                                handleUploadAction(upload.id, 'rejected', feedback);
                              }
                            }}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>👥 User Management</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Location</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Crop Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Joined</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>{user.name}</td>
                      <td style={{ padding: '12px' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: user.role === 'admin' ? '#ddd6fe' : '#dbeafe',
                          color: user.role === 'admin' ? '#7c3aed' : '#2563eb',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {user.role === 'admin' ? '🛡️ Admin' : '🌾 Farmer'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{user.farm_location || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{user.crop_type || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
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
          </div>
        )}

        {/* Scheme Management Tab */}
        {activeTab === 'schemes' && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>📋 Scheme Management</h2>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {schemes.map((scheme) => (
                <div key={scheme.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{scheme.title}</h4>
                      <p style={{ margin: '0 0 10px 0', color: '#374151' }}>{scheme.description}</p>
                      <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>
                        <strong>Eligibility:</strong> {scheme.eligibility}
                      </p>
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                        <strong>Created:</strong> {new Date(scheme.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteScheme(scheme.id)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginLeft: '15px'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Management Tab */}
        {activeTab === 'contacts' && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>📞 Contact Management</h2>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {contacts.map((contact) => (
                <div key={contact.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{contact.name}</h4>
                  <p style={{ margin: '0 0 5px 0', color: '#374151' }}>
                    <strong>Specialization:</strong> {contact.specialization}
                  </p>
                  <p style={{ margin: '0 0 5px 0', color: '#374151' }}>
                    <strong>Crop Type:</strong> {contact.crop_type}
                  </p>
                  <p style={{ margin: '0 0 5px 0', color: '#374151' }}>
                    <strong>Region:</strong> {contact.region}
                  </p>
                  <p style={{ margin: '0', color: '#374151' }}>
                    <strong>Contact:</strong> {contact.contact_info}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pesticide Management Tab */}
        {activeTab === 'pesticides' && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>🧪 Pesticide Management</h2>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {pesticides.map((pesticide) => (
                <div key={pesticide.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{pesticide.name}</h4>
                  <p style={{ margin: '0 0 5px 0', color: '#374151' }}>
                    <strong>Crop Type:</strong> {pesticide.crop_type}
                  </p>
                  <p style={{ margin: '0 0 5px 0', color: '#374151' }}>
                    <strong>Description:</strong> {pesticide.description}
                  </p>
                  <p style={{ margin: '0 0 5px 0', color: '#374151' }}>
                    <strong>Usage:</strong> {pesticide.recommended_usage}
                  </p>
                  <p style={{ margin: '0', color: '#374151' }}>
                    <strong>Price Range:</strong> {pesticide.price_range}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Privileges Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#fbbf24',
        color: '#92400e',
        padding: '10px 15px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        🔑 Admin Mode Active
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

export default ComprehensiveAdminDashboard;