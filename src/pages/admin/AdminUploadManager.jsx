import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import toast from 'react-hot-toast';

const AdminUploadManager = () => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Check admin authentication
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
    
    loadUploads();
  }, [navigate]);

  const loadUploads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select(`
          *,
          users (name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error('Error loading uploads:', error);
      toast.error('Failed to load uploads');
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error('Error updating upload:', error);
      toast.error('Failed to update upload');
    }
  };

  const deleteUpload = async (uploadId, userName) => {
    if (!confirm(`Are you sure you want to permanently delete this upload from "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', uploadId);

      if (error) throw error;

      toast.success('Upload deleted successfully');
      loadUploads();
    } catch (error) {
      console.error('Error deleting upload:', error);
      toast.error('Failed to delete upload');
    }
  };

  const filteredUploads = uploads.filter(upload => {
    if (filter === 'all') return true;
    return upload.status === filter;
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
          <h2 style={{ color: '#dc2626' }}>Loading Uploads...</h2>
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
              📤 Upload Management
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              Review and manage farmer uploads
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
        {/* Filter Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
          border: '2px solid #fecaca',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'all', name: 'All Uploads', count: uploads.length },
            { id: 'pending', name: 'Pending', count: uploads.filter(u => u.status === 'pending').length },
            { id: 'approved', name: 'Approved', count: uploads.filter(u => u.status === 'approved').length },
            { id: 'rejected', name: 'Rejected', count: uploads.filter(u => u.status === 'rejected').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                backgroundColor: filter === tab.id ? '#dc2626' : 'white',
                color: filter === tab.id ? 'white' : '#dc2626',
                border: `2px solid ${filter === tab.id ? '#dc2626' : '#fecaca'}`,
                padding: '10px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </div>

        {/* Uploads List */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
          border: '2px solid #fecaca'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '20px', fontSize: '20px' }}>
            {filter === 'all' ? 'All Uploads' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Uploads`}
          </h2>
          
          {filteredUploads.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#dc2626', padding: '40px', fontSize: '16px' }}>
              No uploads found for this filter
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {filteredUploads.map((upload) => (
                <div key={upload.id} style={{
                  border: `2px solid ${
                    upload.status === 'pending' ? '#fbbf24' : 
                    upload.status === 'approved' ? '#10b981' : 
                    upload.status === 'rejected' ? '#ef4444' : '#fecaca'
                  }`,
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: upload.status === 'pending' ? '#fef3c7' : '#fef2f2'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#dc2626', fontSize: '18px' }}>
                            {upload.users?.name || 'Unknown User'}
                          </h4>
                          <p style={{ margin: '0', color: '#7f1d1d', fontSize: '14px' }}>
                            📧 {upload.users?.email} | 📱 {upload.users?.phone || 'N/A'}
                          </p>
                        </div>
                        <div style={{
                          backgroundColor: 
                            upload.status === 'pending' ? '#fbbf24' : 
                            upload.status === 'approved' ? '#10b981' : '#ef4444',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {upload.status}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>
                          <strong>🌾 Crop Type:</strong> {upload.crop_type}
                        </p>
                        <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>
                          <strong>📅 Submitted:</strong> {new Date(upload.created_at).toLocaleDateString()} at {new Date(upload.created_at).toLocaleTimeString()}
                        </p>
                        <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>
                          <strong>📝 Description:</strong> {upload.description}
                        </p>
                        {upload.image_url && (
                          <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>
                            <strong>🖼️ Image:</strong> 
                            <a 
                              href={upload.image_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#dc2626', textDecoration: 'underline', marginLeft: '5px' }}
                            >
                              View Image
                            </a>
                          </p>
                        )}
                        {upload.admin_feedback && (
                          <p style={{ margin: '0', color: '#dc2626', fontSize: '14px' }}>
                            <strong>💬 Admin Feedback:</strong> {upload.admin_feedback}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: '20px' }}>
                      {upload.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => {
                              const feedback = prompt('Enter approval feedback (optional):');
                              handleUploadAction(upload.id, 'approved', feedback || 'Approved by admin');
                            }}
                            style={{
                              backgroundColor: '#10b981',
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
                              const feedback = prompt('Enter rejection reason (required):');
                              if (feedback && feedback.trim()) {
                                handleUploadAction(upload.id, 'rejected', feedback);
                              } else {
                                toast.error('Rejection reason is required');
                              }
                            }}
                            style={{
                              backgroundColor: '#ef4444',
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
                      
                      {/* Delete Button - Always Available */}
                      <button
                        onClick={() => deleteUpload(upload.id, upload.users?.name)}
                        style={{
                          backgroundColor: '#7f1d1d',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        🗑️ Delete Upload
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

export default AdminUploadManager;