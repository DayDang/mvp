import api from '../api';

export interface AIAlert {
  id: string;
  type: 'POSITIVE' | 'NEGATIVE' | 'INFO' | 'WARNING';
  message: string;
  action_text?: string;
  source_id?: string;
  created_at: string;
}

export interface AnalyticsDashboard {
  hero: {
    totalMessages: number;
    messagesTrend: number;
    sentimentScore: number;
    sentimentTrend: number;
    activeFlows: number;
    flowSuccessRate: number;
    avgResponseTime: number;
    responseTimeTrend: number;
  };
  alerts: AIAlert[];
  timeline: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  distribution: Array<{
    platform: string;
    count: number;
    color: string;
    percentage: number;
  }>;
}

export const analyticsService = {
  getDashboard: async (workspaceId: string): Promise<AnalyticsDashboard> => {
    const response = await api.get('/analytics/dashboard', {
      headers: { 'x-workspace-id': workspaceId }
    });
    return response.data;
  }
};
