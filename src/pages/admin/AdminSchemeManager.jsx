import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import toast from 'react-hot-toast';

const AdminSchemeManager = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eligibility: '',
    government_link: ''
  });

  useEffect(() => {
    // Check admin authentication
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
    
    loadSchemes();
  }, [navigate]);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchemes(data || []);
    } catch (error) {
      console.error('Error loading schemes:', error);
      toast.error('Failed to load schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.eligibility) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingScheme) {
        // Update existing scheme
        const { error } = await supabase
          .from('schemes')
          .update({
            title: formData.title,
            description: formData.description,
            eligibility: formData.eligibility,
            government_link: formData.government_link
          })
          .eq('id', editingScheme.id);

        if (error) throw error;
        toast.success('Scheme updated successfully');
      } else {
        // Create new scheme
        const { error } = await supabase
          .from('schemes')
          .insert({
            title: formData.title,
            description: formData.description,
            eligibility: formData.eligibility,
            government_link: formData.government_link,
            documents: []
          });

        if (error) throw error;
        toast.success('Scheme created successfully');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        eligibility: '',
        government_link: ''
      });
      setShowAddForm(false);
      setEditingScheme(null);
      loadSchemes();
    } catch (error) {
      console.error('Error saving scheme:', error);
      toast.error('Failed to save scheme');
    }
  };

  const deleteScheme = async (schemeId, schemeTitle) => {
    if (!confirm(`Are you sure you want to delete "${schemeTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('schemes')
        .delete()
        .eq('id', schemeId);

      if (error) throw error;

      toast.success('Scheme deleted successfully');
      loadSchemes();
    } catch (error) {
      console.error('Error deleting scheme:', error);
      toast.error('Failed to delete scheme');
    }
  };

  const startEdit = (scheme) => {
    setEditingScheme(scheme);
    setFormData({
      title: scheme.title,
      description: scheme.description,
      eligibility: scheme.eligibility,
      government_link: scheme.government_link || ''
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingScheme(null);
    setFormData({
      title: '',
      description: '',
      eligibility: '',
      government_link: ''
    });
    setShowAddForm(false);
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
          <h2 style={{ color: '#dc2626' }}>Loading Schemes...</h2>
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
              📋 Scheme Management
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              Manage government schemes and programs
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
        {/* Add Scheme Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {showAddForm ? '❌ Cancel' : '➕ Add New Scheme'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
            border: '2px solid #fecaca',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#dc2626', marginBottom: '20px', fontSize: '18px' }}>
              {editingScheme ? '✏️ Edit Scheme' : '➕ Add New Scheme'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#dc2626', fontWeight: '600' }}>
                  Scheme Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #fecaca',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter scheme title"
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#dc2626', fontWeight: '600' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #fecaca',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minHeight: '100px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Enter scheme description"
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#dc2626', fontWeight: '600' }}>
                  Eligibility Criteria *
                </label>
                <textarea
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #fecaca',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minHeight: '80px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Enter eligibility criteria"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#dc2626', fontWeight: '600' }}>
                  Government Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.government_link}
                  onChange={(e) => setFormData({ ...formData, government_link: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #fecaca',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://example.gov.in/scheme"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {editingScheme ? '💾 Update Scheme' : '➕ Create Scheme'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Schemes List */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(220,38,38,0.1)',
          border: '2px solid #fecaca'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '20px', fontSize: '20px' }}>
            Government Schemes ({schemes.length})
          </h2>
          
          {schemes.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#dc2626', padding: '40px', fontSize: '16px' }}>
              No schemes found. Add your first scheme above.
            </p>
          ) : (
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
                      <h4 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '18px' }}>
                        {scheme.title}
                      </h4>
                      <p style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '14px', lineHeight: '1.5' }}>
                        <strong>📝 Description:</strong> {scheme.description}
                      </p>
                      <p style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '14px', lineHeight: '1.5' }}>
                        <strong>✅ Eligibility:</strong> {scheme.eligibility}
                      </p>
                      {scheme.government_link && (
                        <p style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '14px' }}>
                          <strong>🔗 Link:</strong> 
                          <a 
                            href={scheme.government_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#dc2626', textDecoration: 'underline', marginLeft: '5px' }}
                          >
                            View Official Page
                          </a>
                        </p>
                      )}
                      <p style={{ margin: '0', color: '#7f1d1d', fontSize: '12px' }}>
                        <strong>📅 Created:</strong> {new Date(scheme.created_at).toLocaleDateString()} at {new Date(scheme.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                      <button
                        onClick={() => startEdit(scheme)}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteScheme(scheme.id, scheme.title)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        🗑️ Delete
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

export default AdminSchemeManager;