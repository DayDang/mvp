"use client";

import React, { useState } from "react";
import { 
  Zap, 
  Send, 
  Users, 
  MessageSquare, 
  Instagram, 
  History as HistoryIcon,
  Plus,
  ArrowRight,
  Sparkles,
  Eye,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  MoreVertical,
  ChevronRight,
  Layout,
  User,
  Info,
  Check,
  GitBranch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// --- MOCK DATA ---

const SEGMENTS = [
  { id: "whales", name: "Whales", count: 12, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "leads", name: "Recent Leads", count: 48, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "risk", name: "At Risk", count: 8, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "vip", name: "Ultra VIP", count: 5, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const CONTACTS = [
  { id: "1", name: "Alex Johnson", handle: "@alexj", tier: "Whale" },
  { id: "2", name: "Sarah Miller", handle: "@sarahm", tier: "Lead" },
  { id: "3", name: "Michael Chen", handle: "@mchen", tier: "Gold" },
  { id: "4", name: "Emma Wilson", handle: "@emmaw", tier: "At Risk" },
  { id: "5", name: "James Bond", handle: "@007", tier: "Whale" },
];

const ACTIVE_PULSES = [
  {
    id: "p1",
    title: "Spring Collection Preview",
    status: "Sending",
    platform: "whatsapp",
    progress: 65,
    reach: 128,
    engagement: "High",
    timestamp: "Starting now",
    message: "Hey {first_name}, the Spring '26 preview is live! Check out these pieces based on your interest in {last_interest}.",
    recipients: ["Alex Johnson", "James Bond", "Sarah Miller"],
    metrics: { sent: 83, opened: 54, replied: 22 }
  },
  {
    id: "p2",
    title: "VIP Weekend RSVP",
    status: "Completed",
    platform: "instagram",
    progress: 100,
    reach: 42,
    engagement: "Exceptional",
    timestamp: "2 hours ago",
    message: "Hey @handle! Quick reminder about the VIP Weekend. Don't miss your exclusive access.",
    recipients: ["Emma Wilson", "Michael Chen"],
    metrics: { sent: 42, opened: 41, replied: 38 }
  }
];

const TEMPLATES = [
  { 
    id: "t1",
    title: "Season Drop Invite", 
    usage: "128 times", 
    sentiment: "92%",
    preview: "Hey {first_name}, the Spring '26 preview is live! Based on your interest in {last_interest}, I thought you'd love these pieces.",
    platform: "whatsapp",
    category: "VIP Care"
  },
  { 
    id: "t2",
    title: "VIP Birthday Nuance", 
    usage: "42 times", 
    sentiment: "88%",
    preview: "Happy Birthday @handle! We've prepared something special in {last_interest} for you. Check your DMs!",
    platform: "instagram",
    category: "VIP Care"
  },
  { 
    id: "t3",
    title: "Personal Checkout Assist", 
    usage: "215 times", 
    sentiment: "76%",
    preview: "Hey {first_name}, looks like you left something in your bag. The {last_interest} pieces are moving fast! Need any help?",
    platform: "whatsapp",
    category: "Retention"
  },
  { 
    id: "t4",
    title: "Exclusive Pre-Launch Access", 
    usage: "89 times", 
    sentiment: "95%",
    preview: "Exciting news {first_name}! You've been selected for early access to our {last_interest} drop.",
    platform: "whatsapp",
    category: "Acquisition"
  },
  { 
    id: "t5",
    title: "Dormant Whale Re-engagement", 
    usage: "34 times", 
    sentiment: "84%",
    preview: "It's been a while, @handle! We've missed your eye for {last_interest}. Here's a private look at what's new.",
    platform: "instagram",
    category: "Retention"
  },
  { 
    id: "t6",
    title: "New Lead Welcome Sequence", 
    usage: "512 times", 
    sentiment: "81%",
    preview: "Welcome to Elite, {first_name}! Since you're interested in {last_interest}, here's how we can help you...",
    platform: "telegram",
    category: "Acquisition"
  },
];

// --- COMPONENTS ---

const PlatformIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'whatsapp': return <MessageSquare className={cn("text-green-500", className)} />;
    case 'instagram': return <Instagram className={cn("text-pink-500", className)} />;
    case 'telegram': return <Send className={cn("text-blue-500", className)} />;
    default: return null;
  }
};

export default function BroadcastsPage() {
  const [isComposing, setIsComposing] = useState(false);
  const [isRepoOpen, setIsRepoOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPulse, setSelectedPulse] = useState<typeof ACTIVE_PULSES[0] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'whatsapp' | 'instagram' | 'telegram'>('whatsapp');
  const [message, setMessage] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clientSearch, setClientSearch] = useState("");

  const handleToggleSegment = (id: string) => {
    setSelectedSegments(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleToggleClient = (id: string) => {
    setSelectedClients(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const totalReach = selectedSegments.reduce((acc, id) => acc + (SEGMENTS.find(s => s.id === id)?.count || 0), 0) + selectedClients.length;

  const handleSend = () => {
    toast.success("Broadcast Pulse Initiated", {
      description: `Sending to ${selectedSegments.length || 1} target segments across ${selectedPlatform}.`,
    });
    setIsComposing(false);
    setMessage("");
    setSelectedSegments([]);
  };

  return (
    <div className="flex h-full bg-zinc-950/20 backdrop-blur-sm relative overflow-hidden">
      {/* Main Dashboard */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Broadcast Hub</h1>
              <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Multi-platform mass personalization engine
              </p>
            </div>
            <Button 
              onClick={() => setIsComposing(true)}
              className="bg-primary hover:bg-primary/90 text-black rounded-xl font-bold px-6 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Pulse
            </Button>
          </div>
        </div>

        {/* Content Scroll Area */}
        <ScrollArea className="flex-1 min-h-0 px-8 pb-8">
          <div className="space-y-12">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Weekly Reach</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">1.2k</span>
                  <span className="text-[10px] font-bold text-green-500 flex items-center gap-0.5">
                    <ArrowRight className="w-3 h-3 -rotate-45" /> +12%
                  </span>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-12 h-12 text-white" />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Active Pulses</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">3</span>
                  <span className="text-[10px] font-bold text-zinc-500">Live now</span>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl relative group overflow-hidden" style={{ minWidth: 'min-content' }}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BarChart3 className="w-12 h-12 text-white" />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Avg Sentiment</span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-zinc-600 cursor-help hover:text-zinc-400 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 border-white/10 text-[10px] font-bold text-zinc-300 w-48 p-3 rounded-xl shadow-2xl">
                        Calculated as the percentage of positive/neutral replies relative to total replies for a specific pulse.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">88%</span>
                  <span className="text-[10px] font-bold text-primary italic">Positive</span>
                </div>
              </div>
            </div>

            {/* Active Pulses Section */}
            <section>
              <h2 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Active Strategic Pulses
              </h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {ACTIVE_PULSES.map((pulse) => (
                  <motion.div 
                    layoutId={pulse.id}
                    key={pulse.id}
                    onClick={() => setSelectedPulse(pulse)}
                    className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                          <PlatformIcon type={pulse.platform} className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-100">{pulse.title}</h3>
                          <span className="text-[10px] text-zinc-500 font-medium">{pulse.timestamp}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "rounded-lg text-[9px] font-black uppercase tracking-wider px-2 py-0.5",
                        pulse.status === "Sending" ? "bg-primary/10 text-primary border-primary/20" : "bg-zinc-800 text-zinc-400 border-white/5"
                      )}>
                        {pulse.status}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span>Pulse Progress</span>
                        <span className="text-zinc-300">{pulse.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pulse.progress}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <div className="flex items-center gap-6 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Audience</span>
                          <span className="text-xs font-bold text-zinc-300">{pulse.reach} Contacts</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Engagement</span>
                          <span className="text-xs font-bold text-primary">{pulse.engagement}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Recent History / Templates */}
            <section className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Pulse Templates</h2>
                  <p className="text-xs text-zinc-500 mt-1 font-medium italic">High-conversion relationship blueprints</p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsRepoOpen(true)}
                  className="text-zinc-500 hover:text-white text-xs font-bold"
                >
                  View Repository <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES.map((template) => (
                  <div 
                    key={template.id} 
                    onClick={() => setSelectedTemplate(template)}
                    className="p-5 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group cursor-pointer"
                  >
                    <h4 className="text-sm font-bold text-zinc-200 group-hover:text-primary transition-colors mb-4">{template.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HistoryIcon className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-500">{template.usage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-primary/50" />
                        <span className="text-[10px] font-bold text-zinc-300">{template.sentiment} success</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </div>

      {/* Composer Modal Overlay */}
      <AnimatePresence>
        {isComposing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-5xl bg-[#09090b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[min(850px,90vh)]"
            >
              {/* Left Side: Builder */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-white/5 overflow-hidden bg-zinc-950/20">
                <div className="p-8 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Draft Pulse</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsComposing(false)}
                    className="rounded-xl hover:bg-white/10"
                  >
                    <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-8 pb-20 space-y-10">
                    {/* Audience Segment Selection */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Target Intelligence</label>
                      <div className="flex flex-wrap gap-2">
                        {SEGMENTS.map(segment => (
                          <button 
                            key={segment.id}
                            onClick={() => handleToggleSegment(segment.id)}
                            className={cn(
                              "px-3 py-2 rounded-xl border transition-all flex items-center gap-2",
                              selectedSegments.includes(segment.id)
                                ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                                : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/10"
                            )}
                          >
                            <div className={cn("w-1.5 h-1.5 rounded-full", segment.color.replace('text', 'bg'))} />
                            <span className="text-[10px] font-bold">{segment.name}</span>
                            <span className="text-[9px] font-black opacity-50">{segment.count}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Platform Selector */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Primary Platform</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['whatsapp', 'instagram', 'telegram'] as const).map(p => (
                          <button 
                            key={p}
                            onClick={() => setSelectedPlatform(p)}
                            className={cn(
                              "p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2",
                              selectedPlatform === p
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"
                            )}
                          >
                            <PlatformIcon type={p} className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                    
                    {/* Strategic Flow Selection */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Strategic Automation Flow</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/20 hover:bg-primary/5 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <GitBranch className="w-4 h-4 text-primary" />
                              </div>
                              <div className="text-left">
                                <span className="text-xs font-bold text-zinc-200">Select Strategic Flow</span>
                                <p className="text-[10px] text-zinc-500 font-medium">Auto-trigger automation for this pulse</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-zinc-950 border-white/10 rounded-2xl p-2 w-[340px] backdrop-blur-xl z-[100]">
                          <div className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Available Strategies</div>
                          <DropdownMenuItem 
                            className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" 
                            onClick={() => toast.success("Strategic Flow Selected", { description: "VIP Outreach flow will be applied to all recipients." })}
                          >
                            <GitBranch className="w-4 h-4 text-amber-500" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">VIP Outreach</span>
                              <span className="text-[10px] text-zinc-500">89% success rate • Multi-touch</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3"
                            onClick={() => toast.success("Strategic Flow Selected", { description: "Silent Drop Alert will triggered." })}
                          >
                            <Instagram className="w-4 h-4 text-pink-500" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">Silent Drop Alert</span>
                              <span className="text-[10px] text-zinc-500">124 active runs • Real-time</span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </section>

                    {/* Manual Client Selection */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Individual Outreach</label>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                          <Input 
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            placeholder="Find specific clients..."
                            className="bg-white/5 border-white/5 h-12 rounded-xl pl-12 text-xs focus-visible:ring-primary/20"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                          {CONTACTS.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(contact => (
                            <button 
                              key={contact.id}
                              onClick={() => handleToggleClient(contact.id)}
                              className={cn(
                                "p-3 rounded-xl border transition-all flex items-center justify-between group",
                                selectedClients.includes(contact.id)
                                  ? "bg-primary/5 border-primary/20"
                                  : "bg-white/5 border-white/5 hover:border-white/10"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-400 font-bold">{contact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                  <div className="text-[10px] font-bold text-zinc-200">{contact.name}</div>
                                  <div className="text-[8px] font-medium text-zinc-500">{contact.handle}</div>
                                </div>
                              </div>
                              {selectedClients.includes(contact.id) && <Check className="w-3 h-3 text-primary" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Message Input */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Strategic Message</label>
                      <div className="relative group">
                        <textarea 
                          placeholder="Compose your high-touch update..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 h-48 text-sm focus:outline-none focus:border-primary/30 transition-all text-zinc-200 placeholder:text-zinc-700 resize-none font-medium leading-relaxed"
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="bg-white/5 text-[10px] font-black uppercase tracking-widest h-8 rounded-lg hover:bg-primary/20 hover:text-primary transition-all text-zinc-400 border border-white/5"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Token
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-zinc-950 border-white/10 rounded-xl p-2 min-w-[160px]">
                              <DropdownMenuItem 
                                onClick={() => setMessage(prev => prev + " {first_name}")}
                                className="text-[10px] font-bold text-zinc-400 focus:text-white focus:bg-white/10 rounded-lg cursor-pointer py-2"
                              >
                                <Users className="w-3 h-3 mr-2" /> First Name
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setMessage(prev => prev + (selectedPlatform === 'whatsapp' ? " {last_name}" : " @handle"))}
                                className="text-[10px] font-bold text-zinc-400 focus:text-white focus:bg-white/10 rounded-lg cursor-pointer py-2"
                              >
                                {selectedPlatform === 'whatsapp' ? <Users className="w-3 h-3 mr-2" /> : <Instagram className="w-3 h-3 mr-2" />}
                                {selectedPlatform === 'whatsapp' ? "Last Name" : "Profile Handle"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setMessage(prev => prev + " {last_interest}")}
                                className="text-[10px] font-bold text-zinc-400 focus:text-white focus:bg-white/10 rounded-lg cursor-pointer py-2"
                              >
                                <Sparkles className="w-3 h-3 mr-2" /> Last Interest
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest h-8 rounded-lg hover:bg-primary hover:text-black transition-all"
                            onClick={() => {
                              const template = selectedPlatform === 'whatsapp' 
                                ? "Hey {first_name}, just noticed you were browsing the {last_interest} collection..."
                                : "Check your DMs @handle – the {last_interest} drop is here.";
                              setMessage(template);
                            }}
                          >
                            <Sparkles className="w-3 h-3 mr-1" /> Ghost Mass
                          </Button>
                        </div>
                      </div>
                    </section>
                  </div>
                </ScrollArea>

                <div className="p-8 border-t border-white/5 bg-zinc-950/50 flex-shrink-0">
                  <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-black text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!message || selectedSegments.length === 0}
                    onClick={handleSend}
                  >
                    Initiate Pulse Mission <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Right Side: Elite Preview */}
              <div className="w-80 bg-zinc-950/50 flex flex-col overflow-hidden shrink-0">
                <div className="p-8 border-b border-white/5 flex items-center gap-3">
                  <Eye className="w-4 h-4 text-zinc-500" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tactical Preview</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                   {/* Background Glow */}
                   <div className="absolute inset-0 bg-primary/2 rounded-full blur-[100px]" />

                   {/* Mock Phone Container */}
                   <div className="w-full aspect-[9/16] bg-zinc-900 border-[6px] border-zinc-800 rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
                      {/* Internal Header */}
                      <div className="h-10 bg-zinc-800/80 flex items-center px-4 gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src="https://ui-avatars.com/api/?name=Agent&background=random" />
                          <AvatarFallback>AG</AvatarFallback>
                        </Avatar>
                        <span className="text-[8px] font-bold text-white">Elite Agent</span>
                      </div>
                      
                      {/* Internal Chat Area */}
                      <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end">
                        <motion.div 
                          key={message}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={cn(
                            "max-w-[85%] p-3 rounded-2xl text-[10px] leading-relaxed shadow-lg self-end",
                            selectedPlatform === 'whatsapp' ? "bg-[#0b5048] text-zinc-100 rounded-tr-none" :
                            selectedPlatform === 'instagram' ? "bg-zinc-800 text-zinc-100 rounded-tr-none" :
                            "bg-[#2aabee] text-white rounded-tr-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap font-medium">
                            {message || "Draft your elite message to see the preview..."}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                            <span className="text-[8px]">14:32</span>
                            <CheckCircle2 className="w-2 h-2" />
                          </div>
                        </motion.div>
                      </div>

                      {/* Internal Footer */}
                      <div className="h-12 bg-zinc-800/80 p-2">
                        <div className="w-full h-full bg-zinc-700/50 rounded-full" />
                      </div>
                   </div>

                   {/* Segment Indicator */}
                   <div className="mt-8 flex flex-col items-center">
                     <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Live Reach</span>
                     <div className="flex -space-x-2">
                       {[1,2,3,4].map(i => (
                         <Avatar key={i} className="w-8 h-8 border-2 border-[#09090b]">
                           <AvatarImage src={`https://i.pravatar.cc/100?u=${i}`} />
                           <AvatarFallback>U</AvatarFallback>
                         </Avatar>
                       ))}
                       <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#09090b] flex items-center justify-center">
                         <span className="text-[8px] font-bold text-zinc-400">+{totalReach}</span>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse Details Overlay */}
      <AnimatePresence>
        {selectedPulse && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#09090b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <PlatformIcon type={selectedPulse.platform} className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{selectedPulse.title}</h2>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{selectedPulse.status}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedPulse(null)}
                  className="rounded-xl hover:bg-white/10"
                >
                  <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-8 space-y-8">
                  {/* Performance Metrics */}
                  <section>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Strategic Metrics</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Sent</span>
                        <span className="text-xl font-bold text-white">{selectedPulse.metrics.sent}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Opened</span>
                        <span className="text-xl font-bold text-white">{selectedPulse.metrics.opened}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Replied</span>
                        <span className="text-xl font-bold text-primary">{selectedPulse.metrics.replied}</span>
                      </div>
                    </div>
                  </section>

                  {/* Sent Content */}
                  <section>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Pulse Content</label>
                    <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 relative">
                      <p className="text-sm text-zinc-300 leading-relaxed font-medium italic">
                        "{selectedPulse.message}"
                      </p>
                    </div>
                  </section>

                  {/* Target List */}
                  <section>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Active Recipients</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPulse.recipients.map(r => (
                        <Badge key={r} variant="secondary" className="bg-white/5 text-zinc-400 hover:text-white transition-colors border-white/5 rounded-lg py-1 px-3">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Details Overlay */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-[#09090b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Layout className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{selectedTemplate.title}</h2>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{selectedTemplate.sentiment} Success Rate</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedTemplate(null)}
                  className="rounded-xl hover:bg-white/10"
                >
                  <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
                </Button>
              </div>

              <div className="p-8 space-y-8">
                <section>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Blueprint Preview</label>
                  <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 relative">
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                      {selectedTemplate.preview}
                    </p>
                    <div className="mt-4 flex gap-2">
                       <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-bold uppercase tracking-widest">
                         {selectedTemplate.platform} Optimized
                       </Badge>
                    </div>
                  </div>
                </section>

                <div className="flex gap-4 pt-4">
                  <Button 
                     onClick={() => {
                       setMessage(selectedTemplate.preview);
                       setSelectedPlatform(selectedTemplate.platform as any);
                       setSelectedTemplate(null);
                       setIsRepoOpen(false);
                       setIsComposing(true);
                     }}
                     className="flex-1 h-12 bg-primary text-black font-bold rounded-xl"
                  >
                    Use This Template
                  </Button>
                  <Button 
                     variant="ghost"
                     onClick={() => setSelectedTemplate(null)}
                     className="h-12 text-zinc-500 hover:text-white border border-white/5 rounded-xl px-6"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Repository Modal */}
      <AnimatePresence>
        {isRepoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-6xl h-[85vh] bg-[#09090b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Repo Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                    <HistoryIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Pulse Blueprint Repository</h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Strategic Message Library</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Input 
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      placeholder="Search blueprints..."
                      className="bg-white/5 border-white/5 h-11 rounded-xl pl-12 text-sm focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsRepoOpen(false)}
                  className="rounded-xl hover:bg-white/10"
                >
                  <Plus className="w-6 h-6 rotate-45 text-zinc-500" />
                </Button>
              </div>

              <div className="flex-1 flex min-h-0">
                {/* Repo Sidebar */}
                <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-8 flex-shrink-0">
                  <section>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Categories</label>
                    <div className="space-y-1">
                      {["All", "VIP Care", "Acquisition", "Retention"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                            selectedCategory === cat 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "text-zinc-500 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </section>
                </aside>

                {/* Repo Content */}
                <ScrollArea className="flex-1">
                  <div className="p-8 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {TEMPLATES
                        .filter(t => 
                          (selectedCategory === "All" || t.category === selectedCategory) &&
                          (t.title.toLowerCase().includes(repoSearch.toLowerCase()) || 
                           t.preview.toLowerCase().includes(repoSearch.toLowerCase()))
                        )
                        .map((template) => (
                        <motion.div 
                          layout
                          key={template.id} 
                          onClick={() => {
                            setSelectedTemplate(template);
                          }}
                          className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <PlatformIcon type={template.platform} className="w-12 h-12" />
                          </div>
                          
                          <div className="flex items-start justify-between mb-4">
                            <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border-white/5 bg-zinc-800 text-zinc-400">
                              {template.category}
                            </Badge>
                            <span className="text-[10px] font-bold text-zinc-600">{template.usage} Usage</span>
                          </div>

                          <h4 className="text-base font-bold text-zinc-100 group-hover:text-primary transition-colors mb-3">{template.title}</h4>
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-6 font-medium italic">
                            "{template.preview}"
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-primary" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{template.sentiment} Efficiency</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
