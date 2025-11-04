import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';

const RedAdminDashboard = () => {
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
        loadContacts()
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

  const updateScheme = async (schemeId, updatedData) => {
    try {
      const { error } = await supabase
        .from('schemes')
        .update(updatedData)
        .eq('id', schemeId);

      if (error) throw error;

      toast.success('Scheme updated successfully');
      loadSchemes();
    } catch (error) {
      console.error('Error updating scheme:', error);
      toast.error('Failed to update scheme');
    }
  };

  const updateContact = async (contactId, updatedData) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update(updatedData)
        .eq('id', contactId);

      if (error) throw error;

      toast.success('Contact updated successfully');
      loadContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminLoginTime');
    toast.success('Logged out successfully');
    navigate('/admin-login');
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
          <h2 style={{ color: '#dc2626' }}>Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef2f2' }}>
      {/* Admin Header */}
      <div style={{
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(220,38,38,0.2)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
              🔴 FARMTECH ADMIN PANEL
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              Simple Admin Management System
            </p>
          </div>
          <button
            onClick={handleLogout}
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
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Navigation Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
          border: '2px solid #fecaca',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {[
            { id: 'overview', name: '📊 Overview' },
            { id: 'uploads', name: '📤 Review Uploads' },
            { id: 'orders', name: '📦 View Orders' },
            { id: 'schemes', name: '📋 Update Schemes' },
            { id: 'contacts', name: '📞 Update Contacts' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: activeTab === tab.id ? '#dc2626' : 'white',
                color: activeTab === tab.id ? 'white' : '#dc2626',
                border: `2px solid ${activeTab === tab.id ? '#dc2626' : '#fecaca'}`,
                padding: '12px 18px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
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
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
                border: '2px solid #fecaca',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 10px 0', fontSize: '16px' }}>👥 Total Users</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#dc2626' }}>
                  {stats.totalUsers}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
                border: '2px solid #fecaca',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 10px 0', fontSize: '16px' }}>📤 Total Uploads</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#dc2626' }}>
                  {stats.totalUploads}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
                border: '2px solid #fecaca',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 10px 0', fontSize: '16px' }}>⏳ Pending Reviews</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#dc2626' }}>
                  {stats.pendingUploads}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
                border: '2px solid #fecaca',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 10px 0', fontSize: '16px' }}>📋 Total Schemes</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#dc2626' }}>
                  {stats.totalSchemes}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
                border: '2px solid #fecaca',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 10px 0', fontSize: '16px' }}>📞 Expert Contacts</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#dc2626' }}>
                  {stats.totalContacts}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
              border: '2px solid #fecaca'
            }}>
              <h2 style={{ color: '#dc2626', marginBottom: '20px', fontSize: '20px' }}>🚀 Quick Actions</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <button
                  onClick={() => setActiveTab('uploads')}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  📤 Review Uploads ({stats.pendingUploads})
                </button>
                
                <button
                  onClick={() => setActiveTab('schemes')}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  📋 Update Schemes ({stats.totalSchemes})
                </button>
                
                <button
                  onClick={() => setActiveTab('contacts')}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  📞 Update Contacts ({stats.totalContacts})
                </button>
                
                <button
                  onClick={loadAllData}
                  style={{
                    backgroundColor: '#b91c1c',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Reviews Tab */}
        {activeTab === 'uploads' && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
            border: '2px solid #fecaca'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '20px', fontSize: '20px' }}>📤 Review Farmer Uploads</h2>
            
            {uploads.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#dc2626', padding: '40px', fontSize: '16px' }}>
                No uploads found
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {uploads.map((upload) => (
                  <div key={upload.id} style={{
                    border: `2px solid ${upload.status === 'pending' ? '#fbbf24' : '#fecaca'}`,
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: upload.status === 'pending' ? '#fef3c7' : '#fef2f2'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '16px' }}>
                          {upload.users?.name || 'Unknown User'}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', color: '#7f1d1d', fontSize: '14px' }}>
                          📧 {upload.users?.email}
                        </p>
                        <p style={{ margin: '0 0 12px 0', color: '#dc2626', fontSize: '14px' }}>
                          <strong>🌾 Crop:</strong> {upload.crop_type} | 
                          <strong> 📊 Status:</strong> {upload.status} |
                          <strong> 📅 Date:</strong> {new Date(upload.created_at).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '0 0 12px 0', color: '#dc2626', fontSize: '14px' }}>
                          <strong>📝 Description:</strong> {upload.description}
                        </p>
                        {upload.admin_feedback && (
                          <p style={{ margin: '0 0 12px 0', color: '#dc2626', fontSize: '14px' }}>
                            <strong>💬 Admin Feedback:</strong> {upload.admin_feedback}
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
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              padding: '10px 15px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600'
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
                              backgroundColor: '#b91c1c',
                              color: 'white',
                              border: 'none',
                              padding: '10px 15px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600'
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

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
            border: '2px solid #fecaca'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '20px', fontSize: '20px' }}>📦 View Orders</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fef2f2' }}>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626' }}>User</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626' }}>Email</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626' }}>Role</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626' }}>Location</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626' }}>Crop Type</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #fecaca', color: '#dc2626' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #fecaca' }}>
                      <td style={{ padding: '15px', color: '#dc2626' }}>{user.name}</td>
                      <td style={{ padding: '15px', color: '#dc2626' }}>{user.email}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          backgroundColor: user.role === 'admin' ? '#dc2626' : '#fecaca',
                          color: user.role === 'admin' ? 'white' : '#dc2626',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {user.role === 'admin' ? '🛡️ Admin' : '🌾 Farmer'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#dc2626' }}>{user.farm_location || 'N/A'}</td>
                      <td style={{ padding: '15px', color: '#dc2626' }}>{user.crop_type || 'N/A'}</td>
                      <td style={{ padding: '15px', fontSize: '14px', color: '#b91c1c' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Update Schemes Tab */}
        {activeTab === 'schemes' && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
            border: '2px solid #fecaca'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '20px', fontSize: '20px' }}>📋 Update Government Schemes</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {schemes.map((scheme) => (
                <div key={scheme.id} style={{
                  border: '2px solid #fecaca',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fef2f2'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#dc2626', fontSize: '18px' }}>{scheme.title}</h4>
                      <p style={{ margin: '0 0 12px 0', color: '#dc2626', fontSize: '14px' }}>{scheme.description}</p>
                      <p style={{ margin: '0 0 12px 0', color: '#b91c1c', fontSize: '14px' }}>
                        <strong>📋 Eligibility:</strong> {scheme.eligibility}
                      </p>
                      <p style={{ margin: '0', color: '#b91c1c', fontSize: '14px' }}>
                        <strong>📅 Created:</strong> {new Date(scheme.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newTitle = prompt('Update scheme title:', scheme.title);
                        const newDescription = prompt('Update scheme description:', scheme.description);
                        const newEligibility = prompt('Update eligibility criteria:', scheme.eligibility);
                        
                        if (newTitle && newDescription && newEligibility) {
                          updateScheme(scheme.id, {
                            title: newTitle,
                            description: newDescription,
                            eligibility: newEligibility
                          });
                        }
                      }}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '10px 15px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginLeft: '15px'
                      }}
                    >
                      ✏️ Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Update Contacts Tab */}
        {activeTab === 'contacts' && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
            border: '2px solid #fecaca'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '20px', fontSize: '20px' }}>📞 Update Expert Contacts</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {contacts.map((contact) => (
                <div key={contact.id} style={{
                  border: '2px solid #fecaca',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fef2f2'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#dc2626', fontSize: '18px' }}>{contact.name}</h4>
                      <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>
                        <strong>🎯 Specialization:</strong> {contact.specialization}
                      </p>
                      <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>
                        <strong>🌾 Crop Type:</strong> {contact.crop_type}
                      </p>
                      <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>
                        <strong>🌍 Region:</strong> {contact.region}
                      </p>
                      <p style={{ margin: '0', color: '#dc2626', fontSize: '14px' }}>
                        <strong>📞 Contact:</strong> {contact.contact_info}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newName = prompt('Update contact name:', contact.name);
                        const newSpecialization = prompt('Update specialization:', contact.specialization);
                        const newContactInfo = prompt('Update contact info:', contact.contact_info);
                        const newRegion = prompt('Update region:', contact.region);
                        
                        if (newName && newSpecialization && newContactInfo && newRegion) {
                          updateContact(contact.id, {
                            name: newName,
                            specialization: newSpecialization,
                            contact_info: newContactInfo,
                            region: newRegion
                          });
                        }
                      }}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '10px 15px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginLeft: '15px'
                      }}
                    >
                      ✏️ Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Status Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '12px 18px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(220,38,38,0.3)',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        🔴 Admin Mode Active
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

export default RedAdminDashboard;