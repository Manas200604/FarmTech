import { describe, test, expect, beforeEach, vi } from 'vitest';
import analyticsService from '../analyticsService';

// Mock Supabase
vi.mock('../../supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            data: [],
            error: null
          }))
        })),
        single: vi.fn(() => ({
          data: null,
          error: null
        })),
        data: [],
        error: null
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  }
}));

import { supabase } from '../../supabase/client';

describe('AnalyticsService', () => {
  beforeEach(() => {
    // Clear cache before each test
    analyticsService.clearCache();
    vi.clearAllMocks();
  });

  describe('Cache Management', () => {
    test('should cache and retrieve data correctly', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test_key';

      // Initially should return null
      expect(analyticsService.getCachedData(cacheKey)).toBeNull();

      // Set cache data
      analyticsService.setCachedData(cacheKey, testData);

      // Should retrieve cached data
      expect(analyticsService.getCachedData(cacheKey)).toEqual(testData);
    });

    test('should expire cached data after timeout', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test_key';

      // Mock cache timeout to be very short
      const originalTimeout = analyticsService.cacheTimeout;
      analyticsService.cacheTimeout = 1; // 1ms

      analyticsService.setCachedData(cacheKey, testData);

      // Wait for cache to expire
      setTimeout(() => {
        expect(analyticsService.getCachedData(cacheKey)).toBeNull();
        analyticsService.cacheTimeout = originalTimeout;
      }, 2);
    });

    test('should clear all cached data', () => {
      analyticsService.setCachedData('key1', { data: 1 });
      analyticsService.setCachedData('key2', { data: 2 });

      analyticsService.clearCache();

      expect(analyticsService.getCachedData('key1')).toBeNull();
      expect(analyticsService.getCachedData('key2')).toBeNull();
    });
  });

  describe('User Growth Metrics', () => {
    test('should process user growth data correctly', () => {
      const mockUsers = [
        { created_at: '2024-01-01T00:00:00Z', role: 'farmer' },
        { created_at: '2024-01-02T00:00:00Z', role: 'farmer' },
        { created_at: '2024-01-03T00:00:00Z', role: 'admin' },
        { created_at: new Date().toISOString(), role: 'farmer' } // Today
      ];

      const result = analyticsService.processUserGrowthData(mockUsers);

      expect(result).toHaveProperty('totalUsers', 4);
      expect(result).toHaveProperty('farmersCount', 3);
      expect(result).toHaveProperty('adminsCount', 1);
      expect(result).toHaveProperty('last30Days');
      expect(result).toHaveProperty('last7Days');
      expect(result).toHaveProperty('growthRate30Days');
      expect(result).toHaveProperty('growthRate7Days');
      expect(result).toHaveProperty('dailyData');
      expect(Array.isArray(result.dailyData)).toBe(true);
    });

    test('should handle empty user data', () => {
      const result = analyticsService.processUserGrowthData([]);

      expect(result.totalUsers).toBe(0);
      expect(result.farmersCount).toBe(0);
      expect(result.adminsCount).toBe(0);
      expect(result.growthRate30Days).toBe(0);
      expect(result.growthRate7Days).toBe(0);
    });

    test('should fetch user growth metrics from database', async () => {
      const mockData = [
        { created_at: '2024-01-01T00:00:00Z', role: 'farmer' },
        { created_at: '2024-01-02T00:00:00Z', role: 'admin' }
      ];

      // Mock the Supabase chain
      const mockSelect = vi.fn().mockReturnValue({
        data: mockData,
        error: null
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await analyticsService.getUserGrowthMetrics();

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('created_at, role');
      expect(result).toHaveProperty('totalUsers', 2);
      expect(result).toHaveProperty('farmersCount', 1);
      expect(result).toHaveProperty('adminsCount', 1);
    });
  });

  describe('Upload Metrics', () => {
    test('should process upload data correctly', () => {
      const mockUploads = [
        { created_at: '2024-01-01T00:00:00Z', status: 'pending', crop_type: 'wheat' },
        { created_at: '2024-01-02T00:00:00Z', status: 'approved', crop_type: 'rice' },
        { created_at: '2024-01-03T00:00:00Z', status: 'rejected', crop_type: 'wheat' },
        { created_at: '2024-01-04T00:00:00Z', status: 'approved', crop_type: 'corn' }
      ];

      const result = analyticsService.processUploadData(mockUploads);

      expect(result).toHaveProperty('totalUploads', 4);
      expect(result).toHaveProperty('pendingUploads', 1);
      expect(result).toHaveProperty('approvedUploads', 2);
      expect(result).toHaveProperty('rejectedUploads', 1);
      expect(result).toHaveProperty('approvalRate', '50.0');
      expect(result).toHaveProperty('rejectionRate', '25.0');
      expect(result).toHaveProperty('cropTypeDistribution');
      expect(result.cropTypeDistribution).toEqual({
        wheat: 2,
        rice: 1,
        corn: 1
      });
    });

    test('should handle empty upload data', () => {
      const result = analyticsService.processUploadData([]);

      expect(result.totalUploads).toBe(0);
      expect(result.pendingUploads).toBe(0);
      expect(result.approvedUploads).toBe(0);
      expect(result.rejectedUploads).toBe(0);
      expect(result.approvalRate).toBe(0);
      expect(result.rejectionRate).toBe(0);
    });

    test('should fetch upload metrics from database', async () => {
      const mockData = [
        { created_at: '2024-01-01T00:00:00Z', status: 'approved', crop_type: 'wheat' }
      ];

      const mockSelect = vi.fn().mockReturnValue({
        data: mockData,
        error: null
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await analyticsService.getUploadMetrics();

      expect(supabase.from).toHaveBeenCalledWith('uploads');
      expect(mockSelect).toHaveBeenCalledWith('created_at, status, crop_type');
      expect(result).toHaveProperty('totalUploads', 1);
      expect(result).toHaveProperty('approvedUploads', 1);
    });
  });

  describe('Platform Activity Metrics', () => {
    test('should fetch platform activity metrics', async () => {
      const mockUsers = [{ created_at: '2024-01-01T00:00:00Z' }];
      const mockUploads = [{ created_at: '2024-01-01T00:00:00Z' }];
      const mockSchemes = [{ created_at: '2024-01-01T00:00:00Z' }];
      const mockContacts = [{ id: '1' }];

      // Mock multiple Supabase calls
      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            data: mockUsers,
            error: null
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            data: mockUploads,
            error: null
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            data: mockSchemes,
            error: null
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            data: mockContacts,
            error: null
          })
        });

      const result = await analyticsService.getPlatformActivityMetrics();

      expect(result).toHaveProperty('totalUsers', 1);
      expect(result).toHaveProperty('totalUploads', 1);
      expect(result).toHaveProperty('totalSchemes', 1);
      expect(result).toHaveProperty('totalContacts', 1);
      expect(result).toHaveProperty('userGrowthTrend');
      expect(result).toHaveProperty('uploadTrend');
    });
  });

  describe('Content Quality Metrics', () => {
    test('should calculate content quality metrics', async () => {
      const mockUploads = [
        { status: 'approved', admin_feedback: 'Good quality', created_at: '2024-01-01T00:00:00Z' },
        { status: 'rejected', admin_feedback: '', created_at: '2024-01-02T00:00:00Z' },
        { status: 'pending', admin_feedback: null, created_at: '2024-01-03T00:00:00Z' }
      ];

      const mockSelect = vi.fn().mockReturnValue({
        data: mockUploads,
        error: null
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await analyticsService.getContentQualityMetrics();

      expect(result).toHaveProperty('totalReviewed', 2); // approved + rejected
      expect(result).toHaveProperty('totalWithFeedback', 1); // only one has feedback
      expect(result).toHaveProperty('feedbackRate', '33.3'); // 1/3 * 100
    });
  });

  describe('Helper Methods', () => {
    test('should group data by day correctly', () => {
      const mockData = [
        { created_at: new Date().toISOString() }, // Today
        { created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }, // Yesterday
        { created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() } // 2 days ago
      ];

      const result = analyticsService.groupByDay(mockData, 3);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('count', 1); // 2 days ago
      expect(result[1]).toHaveProperty('count', 1); // Yesterday
      expect(result[2]).toHaveProperty('count', 1); // Today
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('label');
    });

    test('should calculate average response time', () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      const mockUploads = [
        { status: 'approved', created_at: oneDayAgo.toISOString() },
        { status: 'rejected', created_at: twoDaysAgo.toISOString() },
        { status: 'pending', created_at: now.toISOString() } // Should be ignored
      ];

      const result = analyticsService.calculateAverageResponseTime(mockUploads);

      expect(result).toContain('day'); // Should be in days since > 24 hours
    });
  });

  describe('Event Tracking', () => {
    test('should track events to database', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        data: null,
        error: null
      });
      
      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      await analyticsService.trackEvent('user_login', { userId: '123' });

      expect(supabase.from).toHaveBeenCalledWith('analytics_metrics');
      expect(mockInsert).toHaveBeenCalledWith({
        metric_type: 'user_login',
        value: 1,
        date: expect.any(String),
        metadata: { userId: '123' },
        aggregation_type: 'event'
      });
    });

    test('should handle tracking errors gracefully', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        data: null,
        error: new Error('Database error')
      });
      
      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Should not throw error
      await expect(analyticsService.trackEvent('test_event')).resolves.toBeUndefined();
    });
  });

  describe('Dashboard Summary', () => {
    test('should generate comprehensive dashboard summary', async () => {
      // Mock all the individual metric methods
      vi.spyOn(analyticsService, 'getUserGrowthMetrics').mockResolvedValue({
        totalUsers: 10,
        farmersCount: 8,
        adminsCount: 2
      });

      vi.spyOn(analyticsService, 'getUploadMetrics').mockResolvedValue({
        totalUploads: 50,
        approvalRate: '80.0'
      });

      vi.spyOn(analyticsService, 'getPlatformActivityMetrics').mockResolvedValue({
        totalSchemes: 5,
        totalContacts: 15
      });

      vi.spyOn(analyticsService, 'getContentQualityMetrics').mockResolvedValue({
        feedbackRate: '75.0'
      });

      const result = await analyticsService.generateDashboardSummary();

      expect(result).toHaveProperty('userMetrics');
      expect(result).toHaveProperty('uploadMetrics');
      expect(result).toHaveProperty('platformMetrics');
      expect(result).toHaveProperty('qualityMetrics');
      expect(result).toHaveProperty('generatedAt');
      expect(result.userMetrics.totalUsers).toBe(10);
      expect(result.uploadMetrics.totalUploads).toBe(50);
    });

    test('should handle errors in dashboard summary generation', async () => {
      vi.spyOn(analyticsService, 'getUserGrowthMetrics').mockRejectedValue(new Error('Database error'));

      await expect(analyticsService.generateDashboardSummary()).rejects.toThrow('Database error');
    });
  });

  describe('Date Range Filtering', () => {
    test('should apply date range filters correctly', async () => {
      const dateRange = {
        start: '2024-01-01',
        end: '2024-01-31'
      };

      const mockGte = vi.fn().mockReturnValue({
        lte: vi.fn().mockReturnValue({
          data: [],
          error: null
        })
      });

      const mockSelect = vi.fn().mockReturnValue({
        gte: mockGte
      });
      
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      await analyticsService.getUserGrowthMetrics(dateRange);

      expect(mockSelect).toHaveBeenCalledWith('created_at, role');
      expect(mockGte).toHaveBeenCalledWith('created_at', dateRange.start);
    });
  });
});