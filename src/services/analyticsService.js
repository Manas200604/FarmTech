import { supabase } from '../supabase/client';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // User Growth Metrics
  async getUserGrowthMetrics(dateRange = null) {
    const cacheKey = `user_growth_${dateRange ? `${dateRange.start}_${dateRange.end}` : 'all'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('users')
        .select('created_at, role');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process data for growth metrics
      const metrics = this.processUserGrowthData(data);
      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching user growth metrics:', error);
      throw error;
    }
  }

  processUserGrowthData(users) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalUsers = users.length;
    const farmersCount = users.filter(u => u.role === 'farmer').length;
    const adminsCount = users.filter(u => u.role === 'admin').length;

    const last30Days = users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length;
    const last7Days = users.filter(u => new Date(u.created_at) >= sevenDaysAgo).length;

    // Daily breakdown for charts
    const dailyData = this.groupByDay(users, 30);

    return {
      totalUsers,
      farmersCount,
      adminsCount,
      last30Days,
      last7Days,
      growthRate30Days: totalUsers > 0 ? ((last30Days / totalUsers) * 100).toFixed(1) : 0,
      growthRate7Days: totalUsers > 0 ? ((last7Days / totalUsers) * 100).toFixed(1) : 0,
      dailyData
    };
  }

  // Upload Metrics
  async getUploadMetrics(dateRange = null) {
    const cacheKey = `upload_metrics_${dateRange ? `${dateRange.start}_${dateRange.end}` : 'all'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('uploads')
        .select('created_at, status, crop_type');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;

      const metrics = this.processUploadData(data);
      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching upload metrics:', error);
      throw error;
    }
  }

  processUploadData(uploads) {
    const totalUploads = uploads.length;
    const pendingUploads = uploads.filter(u => u.status === 'pending').length;
    const approvedUploads = uploads.filter(u => u.status === 'approved').length;
    const rejectedUploads = uploads.filter(u => u.status === 'rejected').length;

    const approvalRate = totalUploads > 0 ? ((approvedUploads / totalUploads) * 100).toFixed(1) : 0;
    const rejectionRate = totalUploads > 0 ? ((rejectedUploads / totalUploads) * 100).toFixed(1) : 0;

    // Crop type distribution
    const cropTypeDistribution = uploads.reduce((acc, upload) => {
      const cropType = upload.crop_type || 'Unknown';
      acc[cropType] = (acc[cropType] || 0) + 1;
      return acc;
    }, {});

    // Daily upload trends
    const dailyData = this.groupByDay(uploads, 30);

    return {
      totalUploads,
      pendingUploads,
      approvedUploads,
      rejectedUploads,
      approvalRate,
      rejectionRate,
      cropTypeDistribution,
      dailyData
    };
  }

  // Platform Activity Metrics
  async getPlatformActivityMetrics(dateRange = null) {
    const cacheKey = `platform_activity_${dateRange ? `${dateRange.start}_${dateRange.end}` : 'all'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get data from multiple tables
      const [usersResult, uploadsResult, schemesResult, contactsResult] = await Promise.all([
        supabase.from('users').select('created_at'),
        supabase.from('uploads').select('created_at'),
        supabase.from('schemes').select('created_at'),
        supabase.from('contacts').select('id')
      ]);

      if (usersResult.error) throw usersResult.error;
      if (uploadsResult.error) throw uploadsResult.error;
      if (schemesResult.error) throw schemesResult.error;
      if (contactsResult.error) throw contactsResult.error;

      const metrics = {
        totalUsers: usersResult.data.length,
        totalUploads: uploadsResult.data.length,
        totalSchemes: schemesResult.data.length,
        totalContacts: contactsResult.data.length,
        userGrowthTrend: this.groupByDay(usersResult.data, 7),
        uploadTrend: this.groupByDay(uploadsResult.data, 7)
      };

      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching platform activity metrics:', error);
      throw error;
    }
  }

  // Content Quality Metrics
  async getContentQualityMetrics() {
    const cacheKey = 'content_quality_metrics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data: uploads, error } = await supabase
        .from('uploads')
        .select('status, admin_feedback, created_at');

      if (error) throw error;

      const totalWithFeedback = uploads.filter(u => u.admin_feedback && u.admin_feedback.trim()).length;
      const avgResponseTime = this.calculateAverageResponseTime(uploads);
      
      const qualityMetrics = {
        totalReviewed: uploads.filter(u => u.status !== 'pending').length,
        totalWithFeedback,
        feedbackRate: uploads.length > 0 ? ((totalWithFeedback / uploads.length) * 100).toFixed(1) : 0,
        avgResponseTime: avgResponseTime || 'N/A'
      };

      this.setCachedData(cacheKey, qualityMetrics);
      return qualityMetrics;
    } catch (error) {
      console.error('Error fetching content quality metrics:', error);
      throw error;
    }
  }

  // Helper method to group data by day
  groupByDay(data, days = 30) {
    const result = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = data.filter(item => {
        const itemDate = new Date(item.created_at).toISOString().split('T')[0];
        return itemDate === dateStr;
      }).length;

      result.push({
        date: dateStr,
        count,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return result;
  }

  // Calculate average response time for uploads
  calculateAverageResponseTime(uploads) {
    const reviewedUploads = uploads.filter(u => 
      u.status !== 'pending' && u.created_at
    );

    if (reviewedUploads.length === 0) return null;

    const totalHours = reviewedUploads.reduce((sum, upload) => {
      const created = new Date(upload.created_at);
      const now = new Date();
      const hours = (now - created) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    const avgHours = totalHours / reviewedUploads.length;
    
    if (avgHours < 24) {
      return `${Math.round(avgHours)} hours`;
    } else {
      return `${Math.round(avgHours / 24)} days`;
    }
  }

  // Generate comprehensive dashboard summary
  async generateDashboardSummary(dateRange = null) {
    try {
      const [userMetrics, uploadMetrics, platformMetrics, qualityMetrics] = await Promise.all([
        this.getUserGrowthMetrics(dateRange),
        this.getUploadMetrics(dateRange),
        this.getPlatformActivityMetrics(dateRange),
        this.getContentQualityMetrics()
      ]);

      return {
        userMetrics,
        uploadMetrics,
        platformMetrics,
        qualityMetrics,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating dashboard summary:', error);
      throw error;
    }
  }

  // Track custom events (for future use)
  async trackEvent(eventType, metadata = {}) {
    try {
      const { error } = await supabase
        .from('analytics_metrics')
        .insert({
          metric_type: eventType,
          value: 1,
          date: new Date().toISOString().split('T')[0],
          metadata,
          aggregation_type: 'event'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;