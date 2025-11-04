import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import toast from 'react-hot-toast';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [activeChart, setActiveChart] = useState('users');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.generateDashboardSummary({
        start: dateRange.start,
        end: dateRange.end
      });
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderSimpleChart = (data, title, color = '#3b82f6') => {
    if (!data || data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => d.count));
    const chartHeight = 200;

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>{title}</h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'end', 
          height: `${chartHeight}px`,
          gap: '4px',
          padding: '10px 0'
        }}>
          {data.map((item, index) => {
            const height = maxValue > 0 ? (item.count / maxValue) * (chartHeight - 40) : 0;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: '20px'
                }}
              >
                <div
                  style={{
                    backgroundColor: color,
                    width: '100%',
                    height: `${height}px`,
                    borderRadius: '2px 2px 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    opacity: 0.8
                  }}
                  title={`${item.label}: ${item.count}`}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'scaleY(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '0.8';
                    e.target.style.transform = 'scaleY(1)';
                  }}
                />
                <span style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  marginTop: '5px',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMetricCard = (title, value, subtitle, color, icon) => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: `2px solid ${color}20`,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
      <h3 style={{ color, margin: '0 0 5px 0', fontSize: '14px', fontWeight: '500' }}>
        {title}
      </h3>
      <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  const renderPieChart = (data, title) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No data available
        </div>
      );
    }

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', textAlign: 'center' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(data).map(([key, value], index) => {
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            const color = colors[index % colors.length];
            
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: color,
                    borderRadius: '2px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>{key}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {value} ({percentage}%)
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '3px',
                    marginTop: '4px'
                  }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: color,
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#6b7280' }}>No analytics data available</p>
        <button
          onClick={loadAnalyticsData}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const { userMetrics, uploadMetrics, platformMetrics, qualityMetrics } = dashboardData;

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with Date Range Controls */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>📊 Analytics Dashboard</h2>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#374151' }}>From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            
            <label style={{ fontSize: '14px', color: '#374151' }}>To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            
            <button
              onClick={loadAnalyticsData}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {renderMetricCard(
          'Total Users',
          userMetrics.totalUsers,
          `${userMetrics.last30Days} in last 30 days`,
          '#3b82f6',
          '👥'
        )}
        {renderMetricCard(
          'Total Uploads',
          uploadMetrics.totalUploads,
          `${uploadMetrics.approvalRate}% approval rate`,
          '#10b981',
          '📤'
        )}
        {renderMetricCard(
          'Pending Reviews',
          uploadMetrics.pendingUploads,
          `${uploadMetrics.rejectionRate}% rejection rate`,
          '#f59e0b',
          '⏳'
        )}
        {renderMetricCard(
          'User Growth (30d)',
          `${userMetrics.growthRate30Days}%`,
          `${userMetrics.last7Days} in last 7 days`,
          '#8b5cf6',
          '📈'
        )}
      </div>

      {/* Chart Selection Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'users', name: '👥 User Growth', color: '#3b82f6' },
          { id: 'uploads', name: '📤 Upload Trends', color: '#10b981' },
          { id: 'crops', name: '🌾 Crop Distribution', color: '#f59e0b' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            style={{
              backgroundColor: activeChart === tab.id ? tab.color : 'transparent',
              color: activeChart === tab.id ? 'white' : '#374151',
              border: activeChart === tab.id ? 'none' : '1px solid #d1d5db',
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

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Main Chart */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '300px'
        }}>
          {activeChart === 'users' && renderSimpleChart(
            userMetrics.dailyData,
            'User Registration Trends (Last 30 Days)',
            '#3b82f6'
          )}
          {activeChart === 'uploads' && renderSimpleChart(
            uploadMetrics.dailyData,
            'Upload Activity Trends (Last 30 Days)',
            '#10b981'
          )}
          {activeChart === 'crops' && renderPieChart(
            uploadMetrics.cropTypeDistribution,
            'Crop Type Distribution'
          )}
        </div>

        {/* Secondary Chart/Stats */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '300px'
        }}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>📋 Platform Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151' }}>👥 Farmers</span>
                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{userMetrics.farmersCount}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151' }}>🛡️ Admins</span>
                <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{userMetrics.adminsCount}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151' }}>✅ Approved Uploads</span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{uploadMetrics.approvedUploads}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151' }}>❌ Rejected Uploads</span>
                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{uploadMetrics.rejectedUploads}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151' }}>📋 Total Schemes</span>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{platformMetrics.totalSchemes}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151' }}>📞 Expert Contacts</span>
                <span style={{ fontWeight: 'bold', color: '#06b6d4' }}>{platformMetrics.totalContacts}</span>
              </div>
              
              {qualityMetrics.avgResponseTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#374151' }}>⏱️ Avg Response Time</span>
                  <span style={{ fontWeight: 'bold', color: '#6b7280' }}>{qualityMetrics.avgResponseTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>🎯 Content Quality Metrics</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>
              {qualityMetrics.totalReviewed}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Reviewed</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>
              {qualityMetrics.feedbackRate}%
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Feedback Rate</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '5px' }}>
              {qualityMetrics.totalWithFeedback}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>With Feedback</div>
          </div>
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

export default AnalyticsDashboard;