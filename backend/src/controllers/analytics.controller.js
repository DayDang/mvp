import * as analyticsService from '../services/analytics.service.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }

    const [metrics, timeline, distribution] = await Promise.all([
      analyticsService.getDashboardMetrics(workspaceId),
      analyticsService.getSentimentTimeline(workspaceId),
      analyticsService.getPlatformDistribution(workspaceId)
    ]);

    res.json({
      ...metrics,
      timeline,
      distribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
