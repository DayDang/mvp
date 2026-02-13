import { prisma } from '../config/database.js';

/**
 * Analytics Service for tactical business intelligence
 */

export const getDashboardMetrics = async (workspaceId) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const wsFilter = { chat: { account: { workspace_id: workspaceId } } };

    // 1. Total Messages (last 30 days) + trend vs previous 30 days
    const totalMessages = await prisma.message.count({
      where: { timestamp: { gte: thirtyDaysAgo }, ...wsFilter }
    });
    const prevMessages = await prisma.message.count({
      where: { timestamp: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, ...wsFilter }
    });
    const messagesTrend = prevMessages > 0
      ? Math.round(((totalMessages - prevMessages) / prevMessages) * 100)
      : 0;

    // 2. Sentiment IQ (avg score) + trend vs previous 7 days
    const sentimentAgg = await prisma.message.aggregate({
      _avg: { sentiment_score: true },
      where: { sentiment_score: { not: null }, ...wsFilter }
    });
    const avgSentiment = Math.round(sentimentAgg._avg.sentiment_score || 0);

    const recentSentiment = await prisma.message.aggregate({
      _avg: { sentiment_score: true },
      where: { sentiment_score: { not: null }, timestamp: { gte: sevenDaysAgo }, ...wsFilter }
    });
    const prevSentiment = await prisma.message.aggregate({
      _avg: { sentiment_score: true },
      where: { sentiment_score: { not: null }, timestamp: { gte: fourteenDaysAgo, lt: sevenDaysAgo }, ...wsFilter }
    });
    const recentAvg = recentSentiment._avg.sentiment_score || 0;
    const prevAvg = prevSentiment._avg.sentiment_score || 0;
    const sentimentTrend = prevAvg > 0
      ? Math.round(((recentAvg - prevAvg) / prevAvg) * 100)
      : 0;

    // 3. Active Flows
    const activeFlows = await prisma.automation.count({
      where: { workspace_id: workspaceId, status: 'Active' }
    });
    const totalFlows = await prisma.automation.count({
      where: { workspace_id: workspaceId }
    });
    const flowSuccessRate = totalFlows > 0
      ? Math.round((activeFlows / totalFlows) * 100)
      : 0;

    // 4. Avg Response Time (minutes between incoming msg and our reply)
    const recentChats = await prisma.chat.findMany({
      where: { account: { workspace_id: workspaceId } },
      select: { unipile_id: true },
      take: 20
    });
    let totalResponseMs = 0;
    let responseCount = 0;
    for (const chat of recentChats) {
      const msgs = await prisma.message.findMany({
        where: { chat_id: chat.unipile_id },
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true, is_from_me: true },
        take: 50
      });
      for (let i = 1; i < msgs.length; i++) {
        if (!msgs[i - 1].is_from_me && msgs[i].is_from_me && msgs[i].timestamp && msgs[i - 1].timestamp) {
          const diff = new Date(msgs[i].timestamp).getTime() - new Date(msgs[i - 1].timestamp).getTime();
          if (diff > 0 && diff < 24 * 60 * 60 * 1000) { // cap at 24h to filter outliers
            totalResponseMs += diff;
            responseCount++;
          }
        }
      }
    }
    const avgResponseTime = responseCount > 0
      ? parseFloat((totalResponseMs / responseCount / 60000).toFixed(1))
      : 0;

    // 5. Recent AI Alerts
    const alerts = await prisma.aIAlert.findMany({
      where: { workspace_id: workspaceId, is_resolved: false },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    return {
      hero: {
        totalMessages,
        messagesTrend,
        sentimentScore: avgSentiment,
        sentimentTrend,
        activeFlows,
        flowSuccessRate,
        avgResponseTime,
        responseTimeTrend: 0 // needs historical tracking to compute properly
      },
      alerts
    };
  } catch (error) {
    console.error('Analytics Service Error (getDashboardMetrics):', error);
    throw error;
  }
};

export const getSentimentTimeline = async (workspaceId) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const messages = await prisma.message.findMany({
      where: {
        timestamp: { gte: sevenDaysAgo },
        chat: { account: { workspace_id: workspaceId } },
        sentiment_label: { not: null }
      },
      select: {
        timestamp: true,
        sentiment_label: true
      }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timelineMap = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = days[d.getDay()];
      timelineMap[dayLabel] = { date: dayLabel, positive: 0, neutral: 0, negative: 0, count: 0 };
    }

    messages.forEach(msg => {
      const dayLabel = days[new Date(msg.timestamp).getDay()];
      if (timelineMap[dayLabel]) {
        timelineMap[dayLabel].count++;
        if (msg.sentiment_label === 'POSITIVE') timelineMap[dayLabel].positive++;
        else if (msg.sentiment_label === 'NEGATIVE') timelineMap[dayLabel].negative++;
        else timelineMap[dayLabel].neutral++;
      }
    });

    // Convert to percentages for the chart
    return Object.values(timelineMap).map(day => {
      if (day.count === 0) return { date: day.date, positive: 0, neutral: 0, negative: 0 };
      return {
        date: day.date,
        positive: Math.round((day.positive / day.count) * 100),
        neutral: Math.round((day.neutral / day.count) * 100),
        negative: Math.round((day.negative / day.count) * 100),
      };
    });
  } catch (error) {
    console.error('Analytics Service Error (getSentimentTimeline):', error);
    return [];
  }
};

export const getPlatformDistribution = async (workspaceId) => {
  try {
    const rawCounts = await prisma.account.findMany({
      where: { workspace_id: workspaceId },
      include: { _count: { select: { chats: true } } }
    });
    
    const platformMap = {
      'WHATSAPP': { color: '#25D366' },
      'INSTAGRAM': { color: '#E4405F' },
      'TELEGRAM': { color: '#0088cc' }
    };
    
    let total = 0;
    const distribution = rawCounts.map(acc => {
      const count = acc._count.chats;
      total += count;
      return {
        platform: acc.provider || 'Unknown',
        count,
        color: platformMap[acc.provider] ? platformMap[acc.provider].color : '#71717a'
      };
    });
    
    return distribution.map(d => ({
      ...d,
      percentage: total > 0 ? Math.round((d.count / total) * 100) : 0
    }));
  } catch (error) {
    console.error('Analytics Service Error (getPlatformDistribution):', error);
    throw error;
  }
};
