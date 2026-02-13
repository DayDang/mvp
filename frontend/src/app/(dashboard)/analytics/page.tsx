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
  Activity,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEffect, useState, useCallback } from "react";
import { analyticsService, AnalyticsDashboard } from "@/lib/services/analyticsService";
import { useAuth } from "@/context/AuthContext";

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
  const isPositive = trend >= 0;
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
  const { currentWorkspaceId } = useAuth();
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentWorkspaceId) return;
    try {
      setIsLoading(true);
      const dashboard = await analyticsService.getDashboard(currentWorkspaceId);
      setData(dashboard);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="h-full bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Decrypting Insights...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { hero, alerts, timeline, distribution } = data;

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
              value={hero.totalMessages.toLocaleString()}
              trend={hero.messagesTrend}
              icon={MessageSquare}
            />
            <StatCard
              title="AI Sentiment IQ"
              value={hero.sentimentScore}
              trend={hero.sentimentTrend}
              icon={Brain}
              suffix="%"
              trendLabel="Positive sentiment"
            />
            <StatCard
              title="Active Flows"
              value={hero.activeFlows}
              trend={hero.flowSuccessRate}
              icon={Zap}
              trendLabel={`${hero.flowSuccessRate}% active ratio`}
            />
            <StatCard
              title="Avg Response"
              value={hero.avgResponseTime}
              trend={hero.responseTimeTrend}
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
                <AreaChart data={timeline}>
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
                  <span className="text-zinc-500">Negative Spike Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-zinc-500">Positive Trend Analysis</span>
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
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {distribution.map((platform) => (
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
                  {distribution.length === 0 && (
                    <p className="text-[10px] text-zinc-600 italic">No channels detected</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* AI Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-xl"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">AI-Detected Tactical Alerts</h3>
                <p className="text-xs text-zinc-500 font-medium">Critical insights generated from incoming messages</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col justify-between gap-3",
                      alert.type === 'NEGATIVE' && "bg-red-500/5 border-red-500/20",
                      alert.type === 'POSITIVE' && "bg-green-500/5 border-green-500/20",
                      alert.type === 'WARNING' && "bg-amber-500/5 border-amber-500/20",
                      alert.type === 'INFO' && "bg-blue-500/5 border-blue-500/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {alert.type === 'NEGATIVE' && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                      {alert.type === 'POSITIVE' && <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />}
                      {alert.type === 'WARNING' && <Activity className="w-4 h-4 text-amber-500 mt-0.5" />}
                      {alert.type === 'INFO' && <Activity className="w-4 h-4 text-blue-500 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-xs text-zinc-300 font-medium leading-relaxed">{alert.message}</p>
                        <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-widest font-black">{new Date(alert.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    {alert.action_text && (
                      <button className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors self-end uppercase tracking-widest">
                        {alert.action_text} →
                      </button>
                    )}
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="col-span-full py-8 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                    <CheckCircle2 className="w-8 h-8 text-zinc-600 mb-2 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-600">No Critical Alerts</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
