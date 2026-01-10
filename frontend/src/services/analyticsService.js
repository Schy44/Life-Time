import apiClient from '../lib/api';

/**
 * Get basic profile statistics
 */
export const getBasicStats = async () => {
    const response = await apiClient.get('/analytics/basic/');
    return response.data;
};

/**
 * Get list of who viewed your profile
 * @param {number} days - Number of days to look back (default: 30)
 */
export const whoViewedMe = async (days = 30) => {
    const response = await apiClient.get(`/analytics/who-viewed/?days=${days}`);
    return response.data;
};

/**
 * Get advanced analytics with graphs and demographics
 * @param {number} days - Number of days to look back (default: 30)
 */
export const getAdvancedAnalytics = async (days = 30) => {
    const response = await apiClient.get(`/analytics/advanced/?days=${days}`);
    return response.data;
};

/**
 * Get profile strength score and suggestions
 */
export const getProfileStrength = async () => {
    const response = await apiClient.get('/analytics/strength/');
    return response.data;
};

/**
 * Get all analytics data for dashboard
 * @param {number} days - Number of days to look back
 */
export const getDashboardAnalytics = async (days = 30) => {
    try {
        const [basicStats, advancedAnalytics, viewers] = await Promise.all([
            getBasicStats(),
            getAdvancedAnalytics(days),
            whoViewedMe(days)
        ]);

        return {
            basicStats,
            advancedAnalytics,
            viewers: viewers.viewers || [],
            totalViews: viewers.total_views || 0
        };
    } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        throw error;
    }
};

