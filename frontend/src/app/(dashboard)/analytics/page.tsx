"use client";

import { 
  TrendingUp, 
  TrendingDown,
  MessageSquare, 
  Brain,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// --- MOCK DATA ---

const heroMetrics = {
  totalMessages: 1247,
  messagesTrend: 12,
  sentimentScore: 87,
  sentimentTrend: 3,
  activeFlows: 23,
  flowSuccessRate: 94,
  avgResponseTime: 4.2,
  responseTrend: -18,
};

const sentimentData = [
  { date: 'Mon', positive: 85, neutral: 10, negative: 5 },
  { date: 'Tue', positive: 82, neutral: 12, negative: 6 },
  { date: 'Wed', positive: 88, neutral: 8, negative: 4 },
  { date: 'Thu', positive: 75, neutral: 15, negative: 10 },
  { date: 'Fri', positive: 90, neutral: 7, negative: 3 },
  { date: 'Sat', positive: 92, neutral: 6, negative: 2 },
  { date: 'Sun', positive: 89, neutral: 8, negative: 3 },
];

const platformData = [
  { platform: 'WhatsApp', count: 773, percentage: 62, color: '#25D366' },
  { platform: 'Instagram', count: 349, percentage: 28, color: '#E4405F' },
  { platform: 'Telegram', count: 125, percentage: 10, color: '#0088cc' },
];

const flowPerformance = [
  { name: 'VIP Outreach', executions: 89, successRate: 94 },
  { name: 'Silent Drop Alert', executions: 67, successRate: 91 },
  { name: 'Welcome Sequence', executions: 45, successRate: 88 },
  { name: 'Re-engagement', executions: 34, successRate: 85 },
  { name: 'Feedback Loop', executions: 28, successRate: 92 },
];

const alerts = [
  { id: '1', type: 'negative' as const, message: '2 clients mentioned "shipping delay" today', action: 'View conversations' },
  { id: '2', type: 'positive' as const, message: 'Sarah Miller sentiment +45% after your DM', action: 'Trigger upsell flow' },
  { id: '3', type: 'info' as const, message: '"VIP Outreach" flow 94% success (↑ 8%)', action: 'Keep using this strategy' },
];

const activityFeed = [
  { id: '1', type: 'flow' as const, description: 'Flow "VIP Outreach" completed for Alex', timestamp: '2m ago' },
  { id: '2', type: 'ai' as const, description: 'AI detected positive intent from Sarah', timestamp: '8m ago' },
  { id: '3', type: 'message' as const, description: 'New message on Instagram from Michael', timestamp: '15m ago' },
  { id: '4', type: 'broadcast' as const, description: 'Broadcast sent to 47 clients', timestamp: '1h ago' },
  { id: '5', type: 'flow' as const, description: 'Flow "Welcome Sequence" started for Emma', timestamp: '2h ago' },
];

// --- COMPONENTS ---

const StatCard = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  suffix = "",
  trendLabel = "vs last week"
}: { 
  title: string; 
  value: string | number; 
  trend: number; 
  icon: any; 
  suffix?: string;
  trendLabel?: string;
}) => {
  const isPositive = trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          <TrendIcon className="w-3.5 h-3.5" />
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-bold text-white">{value}{suffix}</p>
        <p className="text-[10px] text-zinc-500 font-medium">{trendLabel}</p>
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  return (
    <div className="h-full bg-[#09090b] flex flex-col">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Analytics</h1>
            <p className="text-sm text-zinc-500 font-medium">AI-powered insights for your business</p>
          </div>
          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 rounded-xl px-4 py-2 text-xs font-bold">
            AI Intelligence
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-8 space-y-8 pb-16">
          {/* Hero Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Messages"
              value={heroMetrics.totalMessages.toLocaleString()}
              trend={heroMetrics.messagesTrend}
              icon={MessageSquare}
            />
            <StatCard
              title="AI Sentiment IQ"
              value={heroMetrics.sentimentScore}
              trend={heroMetrics.sentimentTrend}
              icon={Brain}
              suffix="%"
              trendLabel="Positive sentiment"
            />
            <StatCard
              title="Active Flows"
              value={heroMetrics.activeFlows}
              trend={heroMetrics.flowSuccessRate - 90}
              icon={Zap}
              trendLabel={`${heroMetrics.flowSuccessRate}% success rate`}
            />
            <StatCard
              title="Avg Response"
              value={heroMetrics.avgResponseTime}
              trend={heroMetrics.responseTrend}
              icon={Clock}
              suffix=" min"
              trendLabel="Response time"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-xl"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">AI Sentiment Analysis</h3>
                <p className="text-xs text-zinc-500 font-medium">Last 7 days</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={sentimentData}>
                  <defs>
                    <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#52525b" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="positive" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#sentimentGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-zinc-500">Negative Spike: Thu (shipping)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-zinc-500">Positive Surge: Sat (new drop)</span>
                </div>
              </div>
            </motion.div>

            {/* Platform Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-xl"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">Platform Distribution</h3>
                <p className="text-xs text-zinc-500 font-medium">Message channels</p>
              </div>
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {platformData.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: platform.color }}
                        ></div>
                        <span className="text-xs font-medium text-zinc-300">{platform.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{platform.percentage}%</span>
                        <span className="text-[10px] text-zinc-600">{platform.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Flow Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">AI Automation Intelligence</h3>
                <p className="text-xs text-zinc-500 font-medium">Flow execution summary (This week)</p>
              </div>
              <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 rounded-lg px-3 py-1 text-[10px] font-bold">
                AI Handover: 12%
              </Badge>
            </div>
            <div className="space-y-4">
              {flowPerformance.map((flow, index) => (
                <div key={flow.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">{flow.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-600">{flow.executions} runs</span>
                      <span className="text-xs font-bold text-green-500">{flow.successRate}% ✓</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${flow.successRate}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Alerts & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-xl"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">AI-Detected Alerts</h3>
                <p className="text-xs text-zinc-500 font-medium">Critical insights</p>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-xl border flex items-start justify-between gap-3",
                      alert.type === 'negative' && "bg-red-500/5 border-red-500/20",
                      alert.type === 'positive' && "bg-green-500/5 border-green-500/20",
                      alert.type === 'info' && "bg-blue-500/5 border-blue-500/20"
                    )}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {alert.type === 'negative' && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                      {alert.type === 'positive' && <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />}
                      {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-500 mt-0.5" />}
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed">{alert.message}</p>
                    </div>
                    <button className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
                      {alert.action} →
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-xl"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">Recent Activity</h3>
                <p className="text-xs text-zinc-500 font-medium">Latest events</p>
              </div>
              <div className="space-y-4">
                {activityFeed.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5",
                      item.type === 'flow' && "bg-primary",
                      item.type === 'ai' && "bg-purple-500",
                      item.type === 'message' && "bg-blue-500",
                      item.type === 'broadcast' && "bg-green-500"
                    )}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 font-medium">{item.description}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
